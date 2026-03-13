import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";
import { Button, TextField, Card } from "../../components/ui";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      return setError("Please enter your email address");
    }

    setLoading(true);
    setError(null);

    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            position: "absolute",
            top: 60,
            left: 28,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: fonts.regular,
              color: colors.primary,
              fontSize: 16,
            }}
          >
            Back
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 28,
            fontFamily: fonts.accent,
            color: colors.primary,
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: 0.5,
          }}
        >
          Reset Password
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontFamily: fonts.regular,
            color: colors.textMuted,
            textAlign: "center",
            marginBottom: 44,
            lineHeight: 22,
          }}
        >
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <Card
            shadow="sm"
            style={{
              padding: 28,
              alignItems: "center",
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: fonts.bold,
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Check your email
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: fonts.regular,
                color: colors.textMuted,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              We sent a password reset link to {email.trim()}. Follow the link
              to set a new password.
            </Text>
            <Button
              label="Back to Sign In"
              onPress={() => router.back()}
              style={{ marginTop: 24, paddingHorizontal: 32 }}
            />
          </Card>
        ) : (
          <>
            <TextField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoFocus
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
              label="Send Reset Link"
              onPress={handleReset}
              loading={loading}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
