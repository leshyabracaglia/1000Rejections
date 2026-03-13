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
import { Link, router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return setError("Please enter email and password");
    }

    setLoading(true);
    setError(null);

    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.replace("/(main)");
    }
  };

  const inputStyle = {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.regular,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
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
          1000 Rejections
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
          Embrace rejection, build resilience
        </Text>

        <TextInput
          style={inputStyle}
          placeholder="Email"
          placeholderTextColor={`${colors.textMuted}77`}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextInput
          style={inputStyle}
          placeholder="Password"
          placeholderTextColor={`${colors.textMuted}77`}
          value={password}
          onChangeText={setPassword}
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
          onPress={handleLogin}
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
              Sign In
            </Text>
          )}
        </Pressable>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={{ alignSelf: "center", marginTop: 20 }}>
            <Text
              style={{
                fontFamily: fonts.regular,
                color: `${colors.textMuted}99`,
                fontSize: 14,
              }}
            >
              Forgot password?
            </Text>
          </Pressable>
        </Link>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.regular,
              color: `${colors.textMuted}99`,
              fontSize: 14,
            }}
          >
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontFamily: fonts.bold,
                }}
              >
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
