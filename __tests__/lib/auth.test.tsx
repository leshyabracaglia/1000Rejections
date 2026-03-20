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

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      verifyOtp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
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

function SendOtpConsumer() {
  const { sendOtp } = useAuth();
  const [result, setResult] = React.useState<string>("idle");
  return (
    <>
      <Text testID="result">{result}</Text>
      <Text
        testID="trigger"
        onPress={async () => {
          const { error } = await sendOtp("+15551234567");
          setResult(error ? error.message : "sent");
        }}
      >
        Send
      </Text>
    </>
  );
}

function VerifyOtpConsumer() {
  const { verifyOtp } = useAuth();
  const [result, setResult] = React.useState<string>("idle");
  return (
    <>
      <Text testID="result">{result}</Text>
      <Text
        testID="trigger"
        onPress={async () => {
          const { error } = await verifyOtp("+15551234567", "123456");
          setResult(error ? error.message : "verified");
        }}
      >
        Verify
      </Text>
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

describe("sendOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls supabase signInWithOtp with the phone number", async () => {
    render(
      <AuthProvider>
        <SendOtpConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("idle"),
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("sent"),
    );
    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
      phone: "+15551234567",
    });
  });

  it("returns error when supabase call fails", async () => {
    (mockAuth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: new Error("Rate limit"),
    });
    render(
      <AuthProvider>
        <SendOtpConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("idle"),
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("Rate limit"),
    );
  });
});

describe("verifyOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls supabase verifyOtp with phone and token", async () => {
    render(
      <AuthProvider>
        <VerifyOtpConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("idle"),
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("verified"),
    );
    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
      phone: "+15551234567",
      token: "123456",
      type: "sms",
    });
  });

  it("returns error when verification fails", async () => {
    (mockAuth.verifyOtp as jest.Mock).mockResolvedValue({
      error: new Error("Invalid code"),
    });
    render(
      <AuthProvider>
        <VerifyOtpConsumer />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("idle"),
    );
    fireEvent.press(screen.getByTestId("trigger"));
    await waitFor(() =>
      expect(screen.getByTestId("result").props.children).toBe("Invalid code"),
    );
  });
});
