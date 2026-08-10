import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";
import { Button, TextField } from "../../components/ui";

const RESET_PASSWORD_STATUS = {
  VERIFYING: "verifying",
  READY: "ready",
  INVALID: "invalid",
} as const;

type IResetPasswordStatus = (typeof RESET_PASSWORD_STATUS)[keyof typeof RESET_PASSWORD_STATUS];

export default function ResetPasswordScreen() {
  const { establishSessionFromUrl, updatePassword } = useAuth();
  const [status, setStatus] = useState<IResetPasswordStatus>(RESET_PASSWORD_STATUS.VERIFYING);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const { error: sessionError } = await establishSessionFromUrl(url);
      if (cancelled) return;
      setStatus(sessionError ? RESET_PASSWORD_STATUS.INVALID : RESET_PASSWORD_STATUS.READY);
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) =>
      handleUrl(url),
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [establishSessionFromUrl]);

  const handleSubmit = async () => {
    if (password?.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return setError("Passwords do not match");

    setSubmitting(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) setError(updateError.message);
    else router.replace(ROUTES.MAIN);
  };

  if (status === RESET_PASSWORD_STATUS.VERIFYING) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: fonts.regular, color: colors.textMuted }}>
          Verifying reset link...
        </Text>
      </View>
    );
  }

  if (status === RESET_PASSWORD_STATUS.INVALID) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          paddingHorizontal: 28,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bold,
            color: colors.error,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          This reset link is invalid or has expired.
        </Text>
        <Button
          label="Back to Sign In"
          variant="outline"
          onPress={() => router.replace(ROUTES.LOGIN)}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: fonts.accent,
              color: colors.primary,
              textAlign: "center",
              marginBottom: 24,
              letterSpacing: 0.5,
            }}
          >
            Set a New Password
          </Text>

          <TextField
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCorrect={false}
          />
          <TextField
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCorrect={false}
          />

          {error && (
            <Text
              style={{
                fontFamily: fonts.regular,
                color: colors.error,
                fontSize: 14,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {error}
            </Text>
          )}

          <Button
            label="Update Password"
            onPress={handleSubmit}
            loading={submitting}
            testID="update-password-button"
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
