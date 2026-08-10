import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth, getAuthUrlType, markEmailJustVerified } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";
import { Button, TextField } from "../../components/ui";

const AUTH_MODES = {
  SIGN_IN: "sign_in",
  SIGN_UP: "sign_up",
  FORGOT_PASSWORD: "forgot_password",
} as const;

type IEmailMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithApple, resetPasswordForEmail, establishSessionFromUrl } =
    useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailMode, setEmailMode] = useState<IEmailMode>(AUTH_MODES.SIGN_IN);

  // Sign in with Apple is iOS-only, and even there only shows up on devices
  // that support it (iOS 13+) -- gate the button on that instead of just
  // Platform.OS so we don't render a button that'll throw when tapped.
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
  }, []);

  // Tapping the "confirm your email" link reopens the app here (see
  // EMAIL_CONFIRMATION_REDIRECT_URL in lib/auth.tsx) with session tokens in
  // the URL. Establish that session and drop the user straight into the app
  // instead of making them type their password right after confirming.
  useEffect(() => {
    let cancelled = false;

    const handleUrl = async (url: string | null) => {
      if (!url || getAuthUrlType(url) !== "signup") return;
      const { error: sessionError } = await establishSessionFromUrl(url);
      if (cancelled || sessionError) return;
      markEmailJustVerified();
      router.replace(ROUTES.MAIN);
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [establishSessionFromUrl]);

  const switchMode = (mode: IEmailMode) => {
    setEmailMode(mode);
    setError(null);
    setInfo(null);
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error: authError, canceled } = await signInWithApple();
    setLoading(false);
    if (canceled) return;
    if (authError) setError(authError.message);
    else router.replace(ROUTES.MAIN);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) return setError("Please enter your email");
    setLoading(true);
    setError(null);
    const { error: authError } = await resetPasswordForEmail(email.trim());
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      switchMode(AUTH_MODES.SIGN_IN);
      setInfo("Check your email for a link to reset your password.");
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim())
      return setError("Please enter your email and password");
    setLoading(true);
    setError(null);
    setInfo(null);

    if (emailMode === AUTH_MODES.SIGN_IN) {
      const { error: authError } = await signInWithEmail(email.trim(), password);
      setLoading(false);
      if (authError) setError(authError.message);
      else router.replace(ROUTES.MAIN);
      return;
    }

    const { error: authError, needsEmailConfirmation } = await signUpWithEmail(
      email.trim(),
      password,
    );
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else if (needsEmailConfirmation) {
      // No session yet: navigating to the main app here would just bounce
      // back to this screen once the auth guard sees there's no session.
      switchMode(AUTH_MODES.SIGN_IN);
      setPassword("");
      setInfo("Check your email and tap the confirmation link to finish signing in.");
    } else {
      router.replace(ROUTES.MAIN);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: fonts.accent,
              color: colors.primary,
              textAlign: "center",
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Rejection Tracker
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: fonts.regular,
              color: colors.textMuted,
              textAlign: "center",
              marginBottom: 32,
              letterSpacing: 0.2,
            }}
          >
            Embrace rejection, build resilience
          </Text>

          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailMode !== AUTH_MODES.FORGOT_PASSWORD && (
            <TextField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
            />
          )}

          {info && (
            <Text
              style={{
                fontFamily: fonts.regular,
                color: colors.secondary,
                fontSize: 14,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {info}
            </Text>
          )}

          {error && (
            <Text
              style={{
                fontFamily: fonts.regular,
                color: colors.error,
                fontSize: 14,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {error}
            </Text>
          )}

          <Button
            label={
              emailMode === AUTH_MODES.SIGN_IN
                ? "Sign In"
                : emailMode === AUTH_MODES.SIGN_UP
                  ? "Create Account"
                  : "Send Reset Link"
            }
            onPress={emailMode === AUTH_MODES.FORGOT_PASSWORD ? handleForgotPassword : handleEmailAuth}
            loading={loading}
            testID="auth-submit-button"
          />

          {emailMode === AUTH_MODES.SIGN_IN && (
            <Pressable
              style={{ alignSelf: "center", marginTop: 16 }}
              onPress={() => switchMode(AUTH_MODES.FORGOT_PASSWORD)}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: `${colors.textMuted}99`,
                  fontSize: 14,
                }}
              >
                Forgot password?
              </Text>
            </Pressable>
          )}

          {appleAuthAvailable && emailMode !== AUTH_MODES.FORGOT_PASSWORD && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 24,
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: `${colors.textMuted}33` }} />
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    color: `${colors.textMuted}99`,
                    fontSize: 13,
                    marginHorizontal: 12,
                  }}
                >
                  or
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: `${colors.textMuted}33` }} />
              </View>

              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={8}
                style={{ height: 48, width: "100%" }}
                onPress={handleAppleAuth}
                testID="apple-auth-button"
              />
            </>
          )}

          <Pressable
            style={{ alignSelf: "center", marginTop: 20 }}
            onPress={() => switchMode(emailMode === AUTH_MODES.SIGN_IN ? AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN)}
          >
            <Text
              style={{
                fontFamily: fonts.regular,
                color: `${colors.textMuted}99`,
                fontSize: 14,
              }}
            >
              {emailMode === AUTH_MODES.SIGN_IN
                ? "Don't have an account? Sign up"
                : emailMode === AUTH_MODES.SIGN_UP
                  ? "Already have an account? Sign in"
                  : "Back to sign in"}
            </Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
