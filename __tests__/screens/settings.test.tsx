import React from "react";
import { Alert } from "react-native";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";

const mockSignOut = jest.fn();
const mockDeleteAccount = jest.fn();
const mockReplace = jest.fn();

jest.mock("../../lib/auth", () => ({
  useAuth: () => ({
    user: { email: "a@b.com" },
    signOut: mockSignOut,
    deleteAccount: mockDeleteAccount,
  }),
}));

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));

jest.spyOn(Alert, "alert");

import SettingsScreen from "../../app/(main)/settings";

async function pressDestructiveAlertButton() {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2];
  const destructive = buttons.find((b: any) => b.style === "destructive");
  await act(async () => destructive.onPress());
}

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteAccount.mockResolvedValue({ error: null });
  });

  it("shows the signed-in user's email", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("a@b.com")).toBeTruthy();
  });

  it("shows a warning before deleting the account", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Delete Account"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete Account",
      expect.stringContaining("cannot be undone"),
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Delete Account", style: "destructive" }),
      ]),
    );
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("deletes the account and returns to login on confirmation", async () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Delete Account"));
    await pressDestructiveAlertButton();
    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/login"),
    );
  });

  it("shows an error and does not navigate when deletion fails", async () => {
    mockDeleteAccount.mockResolvedValue({ error: new Error("db error") });
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Delete Account"));
    await pressDestructiveAlertButton();
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        expect.stringContaining("Failed to delete"),
      ),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("signs out and redirects to login when confirmed", async () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Sign Out"));
    await pressDestructiveAlertButton();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/login"),
    );
  });
});
