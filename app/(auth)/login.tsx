import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, fonts } from '../../constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return setError('Please enter email and password');
    }

    setLoading(true);
    setError(null);

    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.replace('/(main)');
    }
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.regular,
    marginBottom: 16,
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 32, fontFamily: fonts.accent, color: colors.primary, textAlign: 'center', marginBottom: 4 }}>1000 Rejections</Text>
        <Text style={{ fontSize: 16, fontFamily: fonts.regular, color: colors.textMuted, textAlign: 'center', marginBottom: 40 }}>Embrace rejection, build resilience</Text>

        <TextInput
          style={inputStyle}
          placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" autoCorrect={false}
        />
        <TextInput
          style={inputStyle}
          placeholder="Password" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry
        />

        {error && <Text style={{ fontFamily: fonts.regular, color: colors.error, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</Text>}

        <Pressable
          style={({ pressed }) => ({ backgroundColor: colors.primary, borderRadius: 14, padding: 18, alignItems: 'center', opacity: loading ? 0.6 : pressed ? 0.8 : 1 })}
          onPress={handleLogin} disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={{ color: colors.onPrimary, fontSize: 16, fontFamily: fonts.bold }}>Sign In</Text>}
        </Pressable>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={{ alignSelf: 'center', marginTop: 16 }}>
            <Text style={{ fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14 }}>Forgot password?</Text>
          </Pressable>
        </Link>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14 }}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable><Text style={{ color: colors.primary, fontSize: 14, fontFamily: fonts.bold }}>Sign Up</Text></Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
