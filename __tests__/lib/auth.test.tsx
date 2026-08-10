import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

// createURL resolves differently per-environment (Expo Go vs a real build) --
// mocked here so tests don't depend on that runtime resolution, and so it
// still produces the "rejections://<path>" values the assertions below check.
jest.mock("expo-linking", () => ({
  createURL: (path: string) => `rejections://${path.replace(/^\//, "")}`,
}));

const mockStorageList = jest.fn().mockResolvedValue({ data: [], error: null });
const mockStorageRemove = jest.fn().mockResolvedValue({ data: [], error: null });

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({
        data: { session: { access_token: "tok" } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      setSession: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
    storage: {
      from: jest.fn(() => ({
        list: (...args: unknown[]) => mockStorageList(...args),
        remove: (...args: unknown[]) => mockStorageRemove(...args),
      })),
    },
    rpc: jest.fn().mockResolvedValue({ error: null }),
  },
}));

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

function TestConsumer() {
  const { user, loading } = useAuth();
  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="user">{user ? user.id : "null"}</Text>
    </>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
  });

  it("resolves to no user after loading", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false"),
    );
    expect(screen.getByTestId("user").props.children).toBe("null");
  });

  it("restores session from Supabase on mount", async () => {
    const session = {
      user: { id: "123", email: "test@example.com" },
      access_token: "tok",
    };
    (mockAuth.getSession as jest.Mock).mockResolvedValue({ data: { session } });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("user").props.children).toBe("123"),
    );
  });

  it("clears a stale local session when getSession returns an error", async () => {
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: new Error("Invalid Refresh Token: Refresh Token Not Found"),
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false"),
    );
    expect(screen.getByTestId("user").props.children).toBe("null");
    expect(mockAuth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("clears a stale local session when getSession rejects", async () => {
    (mockAuth.getSession as jest.Mock).mockRejectedValue(
      new Error("Invalid Refresh Token: Refresh Token Not Found"),
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false"),
    );
    expect(screen.getByTestId("user").props.children).toBe("null");
    expect(mockAuth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("cleans up auth subscription on unmount", () => {
    const unsubscribe = jest.fn();
    (mockAuth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe } },
    });
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
    (console.error as jest.Mock).mockRestore();
  });
});

describe("signUpWithEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  function SignUpConsumer() {
    const { signUpWithEmail } = useAuth();
    const [result, setResult] = React.useState<string>("idle");
    return (
      <>
        <Text testID="result">{result}</Text>
        <Text
          testID="trigger"
          onPress={async () => {
            const { error, needsEmailConfirmation } = await signUpWithEmail(
              "a@b.com",
              "secret1",
            );
            setResult(
              error ? error.message : needsEmailConfirmation ? "pending" : "signed-up",
            );
          }}
        >
          Sign Up
        </Text>
      </>
    );
  }

  it("resolves needsEmailConfirmation false when a session is returned", async () => {
    render(
      <AuthProvider>
        <SignUpConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("signed-up"),
    );
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "secret1",
      options: { emailRedirectTo: "rejections://login" },
    });
  });

  it("resolves needsEmailConfirmation true when no session is returned", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    render(
      <AuthProvider>
        <SignUpConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("pending"),
    );
  });

  it("returns error when supabase call fails", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: new Error("Email already registered"),
    });
    render(
      <AuthProvider>
        <SignUpConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe(
        "Email already registered",
      ),
    );
  });
});

describe("resetPasswordForEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  function ResetPasswordConsumer() {
    const { resetPasswordForEmail } = useAuth();
    const [result, setResult] = React.useState<string>("idle");
    return (
      <>
        <Text testID="result">{result}</Text>
        <Text
          testID="trigger"
          onPress={async () => {
            const { error } = await resetPasswordForEmail("a@b.com");
            setResult(error ? error.message : "sent");
          }}
        >
          Reset
        </Text>
      </>
    );
  }

  it("calls supabase resetPasswordForEmail with the app's deep link", async () => {
    render(
      <AuthProvider>
        <ResetPasswordConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("sent"),
    );
    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith("a@b.com", {
      redirectTo: "rejections://reset-password",
    });
  });

  it("returns error when supabase call fails", async () => {
    (mockAuth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: new Error("Too many requests"),
    });
    render(
      <AuthProvider>
        <ResetPasswordConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe(
        "Too many requests",
      ),
    );
  });
});

describe("establishSessionFromUrl", () => {
  beforeEach(() => jest.clearAllMocks());

  function EstablishSessionConsumer({ url }: { url: string }) {
    const { establishSessionFromUrl } = useAuth();
    const [result, setResult] = React.useState<string>("idle");
    return (
      <>
        <Text testID="result">{result}</Text>
        <Text
          testID="trigger"
          onPress={async () => {
            const { error } = await establishSessionFromUrl(url);
            setResult(error ? error.message : "established");
          }}
        >
          Establish
        </Text>
      </>
    );
  }

  it("parses the recovery tokens from the URL fragment and calls setSession", async () => {
    render(
      <AuthProvider>
        <EstablishSessionConsumer url="rejections://reset-password#access_token=at-1&refresh_token=rt-1&type=recovery" />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("established"),
    );
    expect(mockAuth.setSession).toHaveBeenCalledWith({
      access_token: "at-1",
      refresh_token: "rt-1",
    });
  });

  it("returns an error without calling setSession when tokens are missing", async () => {
    render(
      <AuthProvider>
        <EstablishSessionConsumer url="rejections://reset-password" />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe(
        "This reset link is invalid or has expired.",
      ),
    );
    expect(mockAuth.setSession).not.toHaveBeenCalled();
  });

  it("returns error when supabase setSession fails", async () => {
    (mockAuth.setSession as jest.Mock).mockResolvedValue({
      error: new Error("Token expired"),
    });
    render(
      <AuthProvider>
        <EstablishSessionConsumer url="rejections://reset-password#access_token=at-1&refresh_token=rt-1" />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe(
        "Token expired",
      ),
    );
  });
});

describe("updatePassword", () => {
  beforeEach(() => jest.clearAllMocks());

  function UpdatePasswordConsumer() {
    const { updatePassword } = useAuth();
    const [result, setResult] = React.useState<string>("idle");
    return (
      <>
        <Text testID="result">{result}</Text>
        <Text
          testID="trigger"
          onPress={async () => {
            const { error } = await updatePassword("new-secret");
            setResult(error ? error.message : "updated");
          }}
        >
          Update
        </Text>
      </>
    );
  }

  it("calls supabase updateUser with the new password", async () => {
    render(
      <AuthProvider>
        <UpdatePasswordConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("updated"),
    );
    expect(mockAuth.updateUser).toHaveBeenCalledWith({
      password: "new-secret",
    });
  });

  it("returns error when supabase call fails", async () => {
    (mockAuth.updateUser as jest.Mock).mockResolvedValue({
      error: new Error("Password too weak"),
    });
    render(
      <AuthProvider>
        <UpdatePasswordConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe(
        "Password too weak",
      ),
    );
  });
});

describe("deleteAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
    mockStorageList.mockResolvedValue({ data: [], error: null });
    mockStorageRemove.mockResolvedValue({ data: [], error: null });
  });

  function DeleteAccountConsumer() {
    const { deleteAccount, loading } = useAuth();
    const [result, setResult] = React.useState<string>("idle");
    return (
      <>
        <Text testID="loading">{String(loading)}</Text>
        <Text testID="result">{result}</Text>
        <Text
          testID="trigger"
          onPress={async () => {
            const { error } = await deleteAccount();
            setResult(error ? error.message : "deleted");
          }}
        >
          Delete
        </Text>
      </>
    );
  }

  it("calls the delete_user RPC and signs out on success", async () => {
    render(
      <AuthProvider>
        <DeleteAccountConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("deleted"),
    );
    expect(supabase.rpc).toHaveBeenCalledWith("delete_user");
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it("returns an error and does not sign out when the RPC fails", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      error: new Error("db error"),
    });
    render(
      <AuthProvider>
        <DeleteAccountConsumer />
      </AuthProvider>,
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("db error"),
    );
    expect(mockAuth.signOut).not.toHaveBeenCalled();
  });

  it("removes the user's uploaded images via the Storage API before deleting the account", async () => {
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "user-1" }, access_token: "tok" } },
    });
    mockStorageList.mockResolvedValue({
      data: [{ name: "photo1.jpg" }, { name: "photo2.jpg" }],
      error: null,
    });

    render(
      <AuthProvider>
        <DeleteAccountConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false"),
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("deleted"),
    );

    expect(mockStorageList).toHaveBeenCalledWith("user-1");
    expect(mockStorageRemove).toHaveBeenCalledWith([
      "user-1/photo1.jpg",
      "user-1/photo2.jpg",
    ]);
    // Storage cleanup happens before the account (and its RLS access) is gone.
    expect(supabase.rpc).toHaveBeenCalledWith("delete_user");
  });

  it("still deletes the account when there are no uploaded images", async () => {
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "user-1" }, access_token: "tok" } },
    });
    mockStorageList.mockResolvedValue({ data: [], error: null });

    render(
      <AuthProvider>
        <DeleteAccountConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false"),
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("deleted"),
    );

    expect(mockStorageRemove).not.toHaveBeenCalled();
  });
});
