import React, { useState } from "react";
import {
  Text,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ImagePickerButton } from "./ImagePickerButton";
import { colors, fonts } from "../constants/theme";
import { Button, TextField, FormField } from "./ui";

export interface RejectionFormValues {
  title: string;
  description: string | null;
  date: string;
  image_url: string | null;
}

interface RejectionFormProps {
  initialValues?: RejectionFormValues;
  onSubmit: (values: RejectionFormValues) => Promise<void>;
  submitLabel: string;
}

export function RejectionForm({
  initialValues,
  onSubmit,
  submitLabel,
}: RejectionFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [date, setDate] = useState<Date>(
    () => (initialValues?.date ? new Date(initialValues.date) : new Date()),
  );
  const [image_url, setImageUrl] = useState<string | null>(
    initialValues?.image_url ?? null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        date: date.toISOString(),
        image_url: image_url ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="Title"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="What did you apply for?"
          containerStyle={{ marginBottom: 20 }}
        />

        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add any notes or details..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          inputStyle={{ minHeight: 100 }}
          containerStyle={{ marginBottom: 20 }}
        />

        <FormField label="Date">
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: colors.surfaceElevated,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: pressed ? colors.border : colors.borderSubtle,
            })}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fonts.regular,
                color: colors.text,
              }}
            >
              {formattedDate}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
              themeVariant="dark"
            />
          )}
        </FormField>

        <ImagePickerButton
          imageUri={image_url}
          onImageSelected={setImageUrl}
        />
      </ScrollView>

      {error && (
        <Text
          style={{
            fontFamily: fonts.regular,
            color: colors.error,
            fontSize: 14,
            paddingHorizontal: 16,
            marginBottom: 8,
          }}
        >
          {error}
        </Text>
      )}

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />
    </KeyboardAvoidingView>
  );
}
