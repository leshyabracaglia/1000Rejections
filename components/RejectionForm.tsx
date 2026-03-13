import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ImagePickerButton } from "./ImagePickerButton";
import { colors, fonts } from "../constants/theme";

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

  const inputStyle = {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 12,
            fontFamily: fonts.accent,
            color: colors.textMuted,
            marginBottom: 8,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Title *
        </Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="What did you apply for?"
          placeholderTextColor={`${colors.textMuted}77`}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 12,
            fontFamily: fonts.accent,
            color: colors.textMuted,
            marginBottom: 8,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Description
        </Text>
        <TextInput
          style={{ ...inputStyle, minHeight: 100 }}
          value={description}
          onChangeText={setDescription}
          placeholder="Add any notes or details..."
          placeholderTextColor={`${colors.textMuted}77`}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 12,
            fontFamily: fonts.accent,
            color: colors.textMuted,
            marginBottom: 8,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Date
        </Text>
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
      </View>

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

      <Pressable
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          borderRadius: 14,
          padding: 18,
          alignItems: "center",
          marginTop: 16,
          marginBottom: 32,
          opacity: loading ? 0.6 : pressed ? 0.9 : 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        })}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text
            style={{
              color: colors.onPrimary,
              fontSize: 16,
              fontFamily: fonts.bold,
              letterSpacing: 0.3,
            }}
          >
            {submitLabel}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
