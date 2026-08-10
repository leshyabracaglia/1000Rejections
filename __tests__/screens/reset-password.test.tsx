import React from "react";
import { Linking } from "react-native";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";

const mockEstablishSessionFromUrl = jest.fn();
const mockUpdatePassword = jest.fn();
const mockReplace = jest.fn();

jest.mock("../../lib/auth", () => ({
  useAuth: () => ({
    establishSessionFromUrl: mockEstablishSessionFromUrl,
    updatePassword: mockUpdatePassword,
  }),
}));

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));

const RECOVERY_URL =
  "rejections://reset-password#access_token=at-1&refresh_token=rt-1&type=recovery";

jest.spyOn(Linking, "getInitialURL").mockResolvedValue(RECOVERY_URL);
jest.spyOn(Linking, "addEventListener").mockReturnValue({
  remove: jest.fn(),
} as any);

import ResetPasswordScreen from "../../app/(auth)/reset-password";

describe("ResetPasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(RECOVERY_URL);
    (Linking.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });
    mockEstablishSessionFromUrl.mockResolvedValue({ error: null });
    mockUpdatePassword.mockResolvedValue({ error: null });
  });

  it("shows a verifying state before the session is established", async () => {
    render(<ResetPasswordScreen />);
    expect(screen.getByText("Verifying reset link...")).toBeTruthy();
    await act(async () => {});
  });

  it("shows the new-password form once the recovery session is established", async () => {
    render(<ResetPasswordScreen />);
    await waitFor(() =>
      expect(mockEstablishSessionFromUrl).toHaveBeenCalledWith(RECOVERY_URL),
    );
    await waitFor(() =>
      expect(screen.getByText("Set a New Password")).toBeTruthy(),
    );
  });

  it("shows an invalid-link message when the session cannot be established", async () => {
    mockEstablishSessionFromUrl.mockResolvedValue({
      error: new Error("This reset link is invalid or has expired."),
    });
    render(<ResetPasswordScreen />);
    await waitFor(() =>
      expect(
        screen.getByText("This reset link is invalid or has expired."),
      ).toBeTruthy(),
    );
  });

  it("requires matching passwords of at least 6 characters", async () => {
    render(<ResetPasswordScreen />);
    await waitFor(() =>
      expect(screen.getByText("Set a New Password")).toBeTruthy(),
    );

    fireEvent.changeText(screen.getByPlaceholderText("New password"), "abc");
    fireEvent.changeText(
      screen.getByPlaceholderText("Confirm new password"),
      "abc",
    );
    fireEvent.press(screen.getByText("Update Password"));
    await waitFor(() =>
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeTruthy(),
    );
    expect(mockUpdatePassword).not.toHaveBeenCalled();

    fireEvent.changeText(
      screen.getByPlaceholderText("New password"),
      "abcdef",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Confirm new password"),
      "abcdefg",
    );
    fireEvent.press(screen.getByText("Update Password"));
    await waitFor(() =>
      expect(screen.getByText("Passwords do not match")).toBeTruthy(),
    );
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it("updates the password and navigates to the main app on success", async () => {
    render(<ResetPasswordScreen />);
    await waitFor(() =>
      expect(screen.getByText("Set a New Password")).toBeTruthy(),
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("New password"),
      "newsecret",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Confirm new password"),
      "newsecret",
    );
    fireEvent.press(screen.getByText("Update Password"));

    await waitFor(() =>
      expect(mockUpdatePassword).toHaveBeenCalledWith("newsecret"),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(main)"));
  });

  it("shows an error and does not navigate when updatePassword fails", async () => {
    mockUpdatePassword.mockResolvedValue({ error: new Error("Weak password") });
    render(<ResetPasswordScreen />);
    await waitFor(() =>
      expect(screen.getByText("Set a New Password")).toBeTruthy(),
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("New password"),
      "newsecret",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Confirm new password"),
      "newsecret",
    );
    fireEvent.press(screen.getByText("Update Password"));

    await waitFor(() =>
      expect(screen.getByText("Weak password")).toBeTruthy(),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
