import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";
import { Button, TextField } from "../../components/ui";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) setError(error.message);
    else
      Alert.alert("Check your email", "We sent you a confirmation link.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontFamily: fonts.accent,
            color: colors.primary,
            textAlign: "center",
            marginBottom: 6,
            letterSpacing: 0.5,
          }}
        >
          Join the Challenge
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontFamily: fonts.regular,
            color: colors.textMuted,
            textAlign: "center",
            marginBottom: 44,
            letterSpacing: 0.2,
          }}
        >
          Start collecting your 1000 rejections
        </Text>

        <TextField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextField
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
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
          label="Create Account"
          onPress={handleSignup}
          loading={loading}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.regular,
              color: `${colors.textMuted}99`,
              fontSize: 14,
            }}
          >
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontFamily: fonts.bold,
                }}
              >
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
