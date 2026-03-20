import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { RejectionForm } from "../../components/RejectionForm";

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props: any) => React.createElement("DateTimePicker", props),
  };
});

jest.mock("../../components/ImagePickerButton", () => ({
  ImagePickerButton: ({ imageUri }: any) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(
      Text,
      null,
      imageUri ? "Has Image" : "Add Image",
    );
  },
}));

describe("RejectionForm", () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => jest.clearAllMocks());

  it("renders form fields and submit button", () => {
    render(<RejectionForm onSubmit={onSubmit} submitLabel="Add Rejection" />);
    expect(
      screen.getByPlaceholderText("What did you apply for?"),
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Add any notes or details..."),
    ).toBeTruthy();
    expect(screen.getByText("Add Rejection")).toBeTruthy();
  });

  it("shows error when submitting without title", async () => {
    render(<RejectionForm onSubmit={onSubmit} submitLabel="Add Rejection" />);
    fireEvent.press(screen.getByText("Add Rejection"));
    await waitFor(() =>
      expect(screen.getByText("Title is required")).toBeTruthy(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with form values on submit", async () => {
    render(<RejectionForm onSubmit={onSubmit} submitLabel="Add Rejection" />);
    fireEvent.changeText(
      screen.getByPlaceholderText("What did you apply for?"),
      "Job at Google",
    );
    fireEvent.press(screen.getByText("Add Rejection"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Job at Google" }),
      ),
    );
  });

  it("populates initial values in edit mode", () => {
    render(
      <RejectionForm
        initialValues={{
          title: "Existing",
          description: "Desc",
          date: "2025-06-15",
          image_url: null,
        }}
        onSubmit={onSubmit}
        submitLabel="Save Changes"
      />,
    );
    expect(screen.getByDisplayValue("Existing")).toBeTruthy();
    expect(screen.getByDisplayValue("Desc")).toBeTruthy();
    expect(screen.getByText("Save Changes")).toBeTruthy();
  });

  it("shows error when onSubmit throws", async () => {
    const failing = jest.fn().mockRejectedValue(new Error("Network error"));
    render(<RejectionForm onSubmit={failing} submitLabel="Add Rejection" />);
    fireEvent.changeText(
      screen.getByPlaceholderText("What did you apply for?"),
      "Something",
    );
    fireEvent.press(screen.getByText("Add Rejection"));
    await waitFor(() =>
      expect(screen.getByText("Network error")).toBeTruthy(),
    );
  });
});
