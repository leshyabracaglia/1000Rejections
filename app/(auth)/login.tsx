import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";
import { Button, TextField } from "../../components/ui";

interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+1", label: "US / Canada", flag: "🇺🇸" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+81", label: "Japan", flag: "🇯🇵" },
  { code: "+55", label: "Brazil", flag: "🇧🇷" },
  { code: "+52", label: "Mexico", flag: "🇲🇽" },
  { code: "+82", label: "South Korea", flag: "🇰🇷" },
  { code: "+86", label: "China", flag: "🇨🇳" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+39", label: "Italy", flag: "🇮🇹" },
  { code: "+31", label: "Netherlands", flag: "🇳🇱" },
  { code: "+46", label: "Sweden", flag: "🇸🇪" },
  { code: "+47", label: "Norway", flag: "🇳🇴" },
  { code: "+65", label: "Singapore", flag: "🇸🇬" },
  { code: "+972", label: "Israel", flag: "🇮🇱" },
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+234", label: "Nigeria", flag: "🇳🇬" },
  { code: "+27", label: "South Africa", flag: "🇿🇦" },
  { code: "+64", label: "New Zealand", flag: "🇳🇿" },
];

type LoginMode = "email";

export default function LoginScreen() {
  const { sendOtp, verifyOtp, signInWithEmail, signUpWithEmail } = useAuth();

  // shared
  const [mode, setMode] = useState<LoginMode>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // phone flow
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  // email flow
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailMode, setEmailMode] = useState<"signIn" | "signUp">("signIn");

  const fullPhone = `${countryCode.code}${phone.trim()}`;

  const switchMode = (m: LoginMode) => {
    setMode(m);
    setError(null);
    setStep(1);
  };

  // --- Phone handlers ---
  const handleSendCode = async () => {
    if (!phone.trim()) return setError("Please enter your phone number");
    setLoading(true);
    setError(null);
    const { error: authError } = await sendOtp(fullPhone);
    setLoading(false);
    if (authError) setError(authError.message);
    else setStep(2);
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) return setError("Please enter the verification code");
    setLoading(true);
    setError(null);
    const { error: authError } = await verifyOtp(fullPhone, otpCode.trim());
    setLoading(false);
    if (authError) setError(authError.message);
    else router.replace("/(main)");
  };

  // --- Email handlers ---
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim())
      return setError("Please enter your email and password");
    setLoading(true);
    setError(null);
    const fn = emailMode === "signIn" ? signInWithEmail : signUpWithEmail;
    const { error: authError } = await fn(email.trim(), password);
    setLoading(false);
    if (authError) setError(authError.message);
    else router.replace("/(main)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>
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
            marginBottom: 32,
            letterSpacing: 0.2,
          }}
        >
          Embrace rejection, build resilience
        </Text>


        {/* ---- EMAIL MODE ---- */}
        {mode === "email" && (
          <>
            <TextField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
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
              label={emailMode === "signIn" ? "Sign In" : "Create Account"}
              onPress={handleEmailAuth}
              loading={loading}
              testID="auth-submit-button"
            />

            <Pressable
              style={{ alignSelf: "center", marginTop: 20 }}
              onPress={() => {
                setEmailMode(emailMode === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: `${colors.textMuted}99`,
                  fontSize: 14,
                }}
              >
                {emailMode === "signIn"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Text>
            </Pressable>
          </>
        )}

        {/* ---- PHONE MODE ---- */}
        {mode === "phone" && step === 1 && (
          <>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
              <Pressable
                onPress={() => setShowPicker(true)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: pressed ? colors.border : colors.borderSubtle,
                  gap: 6,
                })}
              >
                <Text style={{ fontSize: 18 }}>{countryCode.flag}</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: fonts.regular,
                    color: colors.text,
                  }}
                >
                  {countryCode.code}
                </Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <TextField
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <Modal
              visible={showPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                onPress={() => setShowPicker(false)}
              />
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  maxHeight: "60%",
                  paddingTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: fonts.bold,
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  Select Country Code
                </Text>
                <FlatList
                  data={COUNTRY_CODES}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setCountryCode(item);
                        setShowPicker(false);
                      }}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        gap: 12,
                        backgroundColor: pressed
                          ? colors.surfaceLight
                          : "transparent",
                      })}
                    >
                      <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: fonts.regular,
                          color: colors.text,
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: fonts.accent,
                          color: colors.textMuted,
                        }}
                      >
                        {item.code}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </Modal>

            {error && (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: colors.error,
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 12,
                  marginBottom: 4,
                }}
              >
                {error}
              </Text>
            )}

            <View style={{ marginTop: 14 }}>
              <Button
                label="Send Code"
                onPress={handleSendCode}
                loading={loading}
              />
            </View>
          </>
        )}

        {mode === "phone" && step === 2 && (
          <>
            <Text
              style={{
                fontSize: 24,
                fontFamily: fonts.accent,
                color: colors.primary,
                textAlign: "center",
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              Enter Verification Code
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: fonts.regular,
                color: colors.textMuted,
                textAlign: "center",
                marginBottom: 28,
                letterSpacing: 0.2,
              }}
            >
              We sent a code to {fullPhone}
            </Text>

            <TextField
              placeholder="6-digit code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
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

            <Button label="Verify" onPress={handleVerify} loading={loading} />

            <Pressable
              style={{ alignSelf: "center", marginTop: 20 }}
              onPress={() => {
                setStep(1);
                setOtpCode("");
                setError(null);
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: `${colors.textMuted}99`,
                  fontSize: 14,
                }}
              >
                Use a different number
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
