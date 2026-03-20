import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

const mockSendOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockReplace = jest.fn();

jest.mock("../../lib/auth", () => ({
  useAuth: () => ({ sendOtp: mockSendOtp, verifyOtp: mockVerifyOtp }),
}));

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import LoginScreen from "../../app/(auth)/login";

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendOtp.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({ error: null });
  });

  it("renders phone number input and send code button", () => {
    render(<LoginScreen />);
    expect(screen.getByText("1000 Rejections")).toBeTruthy();
    expect(
      screen.getByText("Embrace rejection, build resilience"),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("Phone Number")).toBeTruthy();
    expect(screen.getByText("Send Code")).toBeTruthy();
  });

  it("renders country code selector defaulting to +1", () => {
    render(<LoginScreen />);
    expect(screen.getByText("+1")).toBeTruthy();
  });

  it("shows error when submitting empty phone", async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() =>
      expect(screen.getByText("Please enter your phone number")).toBeTruthy(),
    );
    expect(mockSendOtp).not.toHaveBeenCalled();
  });

  it("calls sendOtp with country code prepended", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() =>
      expect(mockSendOtp).toHaveBeenCalledWith("+15551234567"),
    );
  });

  it("shows OTP input after sending code", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("6-digit code")).toBeTruthy();
      expect(screen.getByText("Verify")).toBeTruthy();
    });
  });

  it("shows error when submitting empty code", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() => expect(screen.getByText("Verify")).toBeTruthy());

    fireEvent.press(screen.getByText("Verify"));
    await waitFor(() =>
      expect(
        screen.getByText("Please enter the verification code"),
      ).toBeTruthy(),
    );
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it("calls verifyOtp with full phone and code", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() =>
      expect(screen.getByPlaceholderText("6-digit code")).toBeTruthy(),
    );

    fireEvent.changeText(screen.getByPlaceholderText("6-digit code"), "123456");
    fireEvent.press(screen.getByText("Verify"));
    await waitFor(() =>
      expect(mockVerifyOtp).toHaveBeenCalledWith("+15551234567", "123456"),
    );
  });

  it("navigates to main on successful verification", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() =>
      expect(screen.getByPlaceholderText("6-digit code")).toBeTruthy(),
    );

    fireEvent.changeText(screen.getByPlaceholderText("6-digit code"), "123456");
    fireEvent.press(screen.getByText("Verify"));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(main)"));
  });

  it("shows error on verification failure", async () => {
    mockVerifyOtp.mockResolvedValue({ error: new Error("Invalid code") });
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() =>
      expect(screen.getByPlaceholderText("6-digit code")).toBeTruthy(),
    );

    fireEvent.changeText(screen.getByPlaceholderText("6-digit code"), "123456");
    fireEvent.press(screen.getByText("Verify"));
    await waitFor(() => expect(screen.getByText("Invalid code")).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("can go back to phone input step", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "5551234567",
    );
    fireEvent.press(screen.getByText("Send Code"));
    await waitFor(() =>
      expect(screen.getByText("Use a different number")).toBeTruthy(),
    );

    fireEvent.press(screen.getByText("Use a different number"));
    expect(screen.getByPlaceholderText("Phone Number")).toBeTruthy();
    expect(screen.getByText("Send Code")).toBeTruthy();
    expect(screen.queryByPlaceholderText("6-digit code")).toBeNull();
  });
});
