import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';

const t = {
  bg: '#121212', surface: '#1E1E1E', primary: '#BB86FC', error: '#CF6679',
  text: '#FFFFFF', textMuted: '#B3B3B3', border: '#333333', onPrimary: '#000000',
};

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      return setError('Please enter your email address');
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 24 }}>
          <Text style={{ color: t.primary, fontSize: 16 }}>Back</Text>
        </Pressable>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: t.primary, textAlign: 'center', marginBottom: 8 }}>
          Reset Password
        </Text>
        <Text style={{ fontSize: 15, color: t.textMuted, textAlign: 'center', marginBottom: 32 }}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={{ backgroundColor: t.surface, borderRadius: 12, padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: t.text, marginBottom: 8 }}>Check your email</Text>
            <Text style={{ fontSize: 15, color: t.textMuted, textAlign: 'center', lineHeight: 22 }}>
              We sent a password reset link to {email.trim()}. Follow the link to set a new password.
            </Text>
            <Pressable
              style={{ backgroundColor: t.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24 }}
              onPress={() => router.back()}
            >
              <Text style={{ color: t.onPrimary, fontSize: 16, fontWeight: '600' }}>Back to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              style={{ backgroundColor: t.surface, borderRadius: 12, padding: 16, fontSize: 16, color: t.text, borderWidth: 1, borderColor: t.border, marginBottom: 16 }}
              placeholder="Email" placeholderTextColor={t.textMuted} value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address" autoCorrect={false} autoFocus
            />

            {error && <Text style={{ color: t.error, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</Text>}

            <Pressable
              style={{ backgroundColor: t.primary, borderRadius: 12, padding: 16, alignItems: 'center', opacity: loading ? 0.6 : 1 }}
              onPress={handleReset} disabled={loading}
            >
              {loading ? <ActivityIndicator color={t.onPrimary} /> : <Text style={{ color: t.onPrimary, fontSize: 16, fontWeight: '600' }}>Send Reset Link</Text>}
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
