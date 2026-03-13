import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";

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
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: 14,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.borderSubtle,
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
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 32,
                marginTop: 24,
                opacity: pressed ? 0.9 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              })}
              onPress={() => router.back()}
            >
              <Text
                style={{
                  color: colors.onPrimary,
                  fontSize: 16,
                  fontFamily: fonts.bold,
                  letterSpacing: 0.3,
                }}
              >
                Back to Sign In
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                fontFamily: fonts.regular,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
              }}
              placeholder="Email"
              placeholderTextColor={`${colors.textMuted}77`}
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

            <Pressable
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 14,
                padding: 18,
                alignItems: "center",
                opacity: loading ? 0.6 : pressed ? 0.9 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              })}
              onPress={handleReset}
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
                  Send Reset Link
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
