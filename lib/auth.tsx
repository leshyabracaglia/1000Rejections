import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

// Resolved at runtime so it points at the right place whether you're running
// in Expo Go (exp://...) or a real dev-client/TestFlight/production build
// (rejections://...). Hardcoding the production scheme here previously meant
// tapping an email link while testing in Expo Go would open the wrong
// installed app -- whichever one actually owns the "rejections" scheme.
const EMAIL_CONFIRMATION_REDIRECT_URL = Linking.createURL("/login");
const PASSWORD_RESET_REDIRECT_URL = Linking.createURL("/reset-password");

// Supabase's auth redirect links carry their params in the URL fragment
// (implicit flow), e.g. rejections://reset-password#access_token=...&type=recovery
function getAuthUrlParams(url: string): URLSearchParams {
  const fragmentIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const paramsString =
    fragmentIndex !== -1
      ? url.slice(fragmentIndex + 1)
      : queryIndex !== -1
        ? url.slice(queryIndex + 1)
        : "";
  return new URLSearchParams(paramsString);
}

function parseRecoveryTokensFromUrl(url: string) {
  const params = getAuthUrlParams(url);
  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
  };
}

// Supabase tags every auth redirect with what triggered it -- "signup",
// "recovery", "magiclink", "email_change" -- so callers can tell them apart
// without caring which screen the deep link happened to land on.
export function getAuthUrlType(url: string): string | null {
  return getAuthUrlParams(url).get("type");
}

// Set right before the login screen navigates to the main app after an
// email-confirmation deep link. The home screen consumes it once on mount to
// show a "verified" banner. A plain in-memory flag (rather than a route
// param) because both the login screen and the root layout's own session
// redirect can race to navigate to the same screen, and this doesn't care
// which one wins.
let emailJustVerified = false;

export function markEmailJustVerified() {
  emailJustVerified = true;
}

export function consumeEmailJustVerifiedFlag(): boolean {
  const value = emailJustVerified;
  emailJustVerified = false;
  return value;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  signInWithApple: () => Promise<{ error: Error | null; canceled?: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  establishSessionFromUrl: (url: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          // A stored refresh token that's no longer valid server-side (e.g.
          // expired, or the account it belonged to was deleted). Clear it
          // locally -- scope: "local" skips the server revoke call, since
          // the token is already invalid there's nothing to revoke -- so we
          // don't keep retrying it on every launch.
          supabase.auth.signOut({ scope: "local" });
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch(() => {
        supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Without this, Supabase's confirmation email links back to its
      // default Site URL (http://localhost:3000), which dead-ends on a
      // phone. Send it to the app's own URL scheme instead.
      options: { emailRedirectTo: EMAIL_CONFIRMATION_REDIRECT_URL },
    });
    // When email confirmation is required, Supabase creates the user but
    // returns no session until the user confirms via email.
    const needsEmailConfirmation = !error && !data.session;
    return { error: error as Error | null, needsEmailConfirmation };
  };

  const signInWithApple = async () => {
    // Apple requires a nonce round-trip to prevent replay attacks: we send
    // Apple a hash of a value only we know, then hand Supabase the raw value
    // so it can verify the identity token's nonce claim matches the hash.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

    let credential: AppleAuthentication.AppleAuthenticationCredential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
    } catch (err) {
      // The user dismissed the system sheet -- not a real error, and
      // distinct from success, so callers don't navigate on it.
      if (err instanceof Error && "code" in err && err.code === "ERR_REQUEST_CANCELED") {
        return { error: null, canceled: true };
      }
      return { error: err instanceof Error ? err : new Error("Apple sign-in failed") };
    }

    if (!credential.identityToken) {
      return { error: new Error("Apple did not return an identity token") };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
      nonce: rawNonce,
    });
    return { error: error as Error | null };
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: PASSWORD_RESET_REDIRECT_URL,
    });
    return { error: error as Error | null };
  };

  const establishSessionFromUrl = async (url: string) => {
    const { accessToken, refreshToken } = parseRecoveryTokensFromUrl(url);
    if (!accessToken || !refreshToken) {
      return { error: new Error("This reset link is invalid or has expired.") };
    }
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const deleteAccount = async () => {
    // Best-effort: storage.objects can't be cleaned up from the delete_user
    // RPC itself (Postgres blocks direct DELETEs on it -- it has to go
    // through the Storage API so the actual file and its metadata row stay
    // in sync). If this fails, we still want the account itself deletable,
    // so any error here doesn't block the RPC below.
    if (user) {
      const { data: files } = await supabase.storage
        .from("rejection-images")
        .list(user.id);
      if (files && files.length > 0) {
        await supabase.storage
          .from("rejection-images")
          .remove(files.map((file) => `${user.id}/${file.name}`));
      }
    }

    const { error } = await supabase.rpc("delete_user");
    if (error) return { error: error as Error };
    await supabase.auth.signOut();
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithApple,
        resetPasswordForEmail,
        establishSessionFromUrl,
        updatePassword,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
