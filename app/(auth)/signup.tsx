import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, fonts } from '../../constants/theme';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) setError(error.message);
    else Alert.alert('Check your email', 'We sent you a confirmation link.', [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]);
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
        <Text style={{ fontSize: 32, fontFamily: fonts.accent, color: colors.primary, textAlign: 'center', marginBottom: 4 }}>Join the Challenge</Text>
        <Text style={{ fontSize: 16, fontFamily: fonts.regular, color: colors.textMuted, textAlign: 'center', marginBottom: 40 }}>Start collecting your 1000 rejections</Text>

        <TextInput style={inputStyle} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
        <TextInput style={inputStyle} placeholder="Password" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={inputStyle} placeholder="Confirm Password" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        {error && <Text style={{ fontFamily: fonts.regular, color: colors.error, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</Text>}

        <Pressable
          style={({ pressed }) => ({ backgroundColor: colors.primary, borderRadius: 14, padding: 18, alignItems: 'center', opacity: loading ? 0.6 : pressed ? 0.8 : 1 })}
          onPress={handleSignup} disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={{ color: colors.onPrimary, fontSize: 16, fontFamily: fonts.bold }}>Create Account</Text>}
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={{ fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14 }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable><Text style={{ color: colors.primary, fontSize: 14, fontFamily: fonts.bold }}>Sign In</Text></Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
