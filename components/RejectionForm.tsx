import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ImagePickerButton } from "./ImagePickerButton";
import { colors, fonts } from "../constants/theme";
import { Button, TextField, FormField } from "./ui";

interface RejectionFormProps {
  initialValues?: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  };
  onSubmit: (values: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  }) => Promise<void>;
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
  const [date, setDate] = useState(initialValues?.date ?? new Date());
  const [imageUri, setImageUri] = useState<string | null>(
    initialValues?.imageUri ?? null,
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
        description: description.trim(),
        date,
        imageUri,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
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
            onChange={(event, selectedDate) => {
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

      <ImagePickerButton imageUri={imageUri} onImageSelected={setImageUri} />

      {error && (
        <Text
          style={{
            fontFamily: fonts.regular,
            color: colors.error,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {error}
        </Text>
      )}

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: 16, marginBottom: 32 }}
      />
    </ScrollView>
  );
}
