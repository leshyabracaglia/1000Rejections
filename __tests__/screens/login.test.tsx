import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

const mockSignInWithEmail = jest.fn();
const mockSignUpWithEmail = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockReplace = jest.fn();

jest.mock("../../lib/auth", () => ({
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
    signUpWithEmail: mockSignUpWithEmail,
    resetPasswordForEmail: mockResetPasswordForEmail,
  }),
}));

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import LoginScreen from "../../app/(auth)/login";

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithEmail.mockResolvedValue({ error: null });
    mockSignUpWithEmail.mockResolvedValue({
      error: null,
      needsEmailConfirmation: false,
    });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it("renders the email sign-in form by default", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Rejection Tracker")).toBeTruthy();
    expect(
      screen.getByText("Embrace rejection, build resilience"),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("shows error when submitting empty credentials", async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Sign In"));
    await waitFor(() =>
      expect(
        screen.getByText("Please enter your email and password"),
      ).toBeTruthy(),
    );
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  it("signs in and navigates to main on success", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "a@b.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "secret1");
    fireEvent.press(screen.getByText("Sign In"));
    await waitFor(() =>
      expect(mockSignInWithEmail).toHaveBeenCalledWith("a@b.com", "secret1"),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(main)"));
  });

  it("shows error on sign-in failure", async () => {
    mockSignInWithEmail.mockResolvedValue({ error: new Error("Invalid login") });
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "a@b.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "secret1");
    fireEvent.press(screen.getByText("Sign In"));
    await waitFor(() =>
      expect(screen.getByText("Invalid login")).toBeTruthy(),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("switches to sign-up mode", () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Don't have an account? Sign up"));
    expect(screen.getByText("Create Account")).toBeTruthy();
  });

  it("signs up and navigates to main when a session is created immediately", async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Don't have an account? Sign up"));
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "new@b.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "secret1");
    fireEvent.press(screen.getByText("Create Account"));
    await waitFor(() =>
      expect(mockSignUpWithEmail).toHaveBeenCalledWith("new@b.com", "secret1"),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(main)"));
  });

  it("shows a confirmation notice instead of navigating when email confirmation is required", async () => {
    mockSignUpWithEmail.mockResolvedValue({
      error: null,
      needsEmailConfirmation: true,
    });
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Don't have an account? Sign up"));
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "new@b.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "secret1");
    fireEvent.press(screen.getByText("Create Account"));

    await waitFor(() =>
      expect(
        screen.getByText(
          "Check your email and tap the confirmation link to finish signing in.",
        ),
      ).toBeTruthy(),
    );
    // Must not navigate to the main app without a session -- that's what
    // caused the "keeps redirecting back to sign-in" App Review bug.
    expect(mockReplace).not.toHaveBeenCalled();
    // Switched back to sign-in mode so the user can log in once confirmed.
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("shows error on sign-up failure", async () => {
    mockSignUpWithEmail.mockResolvedValue({
      error: new Error("Email already registered"),
      needsEmailConfirmation: false,
    });
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Don't have an account? Sign up"));
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "new@b.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "secret1");
    fireEvent.press(screen.getByText("Create Account"));
    await waitFor(() =>
      expect(screen.getByText("Email already registered")).toBeTruthy(),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("switches to forgot-password mode and hides the password field", () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Forgot password?"));
    expect(screen.getByText("Send Reset Link")).toBeTruthy();
    expect(screen.queryByPlaceholderText("Password")).toBeNull();
  });

  it("sends a reset link and returns to sign-in with a confirmation notice", async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Forgot password?"));
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "a@b.com");
    fireEvent.press(screen.getByText("Send Reset Link"));

    await waitFor(() =>
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith("a@b.com"),
    );
    await waitFor(() =>
      expect(
        screen.getByText("Check your email for a link to reset your password."),
      ).toBeTruthy(),
    );
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("shows an error when requesting a reset link without an email", async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Forgot password?"));
    fireEvent.press(screen.getByText("Send Reset Link"));
    await waitFor(() =>
      expect(screen.getByText("Please enter your email")).toBeTruthy(),
    );
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("shows error when the reset request fails", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: new Error("Too many requests"),
    });
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Forgot password?"));
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "a@b.com");
    fireEvent.press(screen.getByText("Send Reset Link"));
    await waitFor(() =>
      expect(screen.getByText("Too many requests")).toBeTruthy(),
    );
  });

  it("can go back to sign-in from forgot-password mode", () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Forgot password?"));
    fireEvent.press(screen.getByText("Back to sign in"));
    expect(screen.getByText("Sign In")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
  });
});
