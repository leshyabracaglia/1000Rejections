import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth';

const t = {
  bg: '#121212', surface: '#1E1E1E', primary: '#BB86FC', error: '#CF6679',
  text: '#FFFFFF', textMuted: '#B3B3B3', border: '#333333', onPrimary: '#000000',
};

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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: t.primary, textAlign: 'center', marginBottom: 4 }}>1000 Rejections</Text>
        <Text style={{ fontSize: 16, color: t.textMuted, textAlign: 'center', marginBottom: 32 }}>Embrace rejection, build resilience</Text>

        <TextInput
          style={{ backgroundColor: t.surface, borderRadius: 12, padding: 16, fontSize: 16, color: t.text, borderWidth: 1, borderColor: t.border, marginBottom: 16 }}
          placeholder="Email" placeholderTextColor={t.textMuted} value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" autoCorrect={false}
        />
        <TextInput
          style={{ backgroundColor: t.surface, borderRadius: 12, padding: 16, fontSize: 16, color: t.text, borderWidth: 1, borderColor: t.border, marginBottom: 16 }}
          placeholder="Password" placeholderTextColor={t.textMuted} value={password} onChangeText={setPassword} secureTextEntry
        />

        {error && <Text style={{ color: t.error, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</Text>}

        <Pressable
          style={{ backgroundColor: t.primary, borderRadius: 12, padding: 16, alignItems: 'center', opacity: loading ? 0.6 : 1 }}
          onPress={handleLogin} disabled={loading}
        >
          {loading ? <ActivityIndicator color={t.onPrimary} /> : <Text style={{ color: t.onPrimary, fontSize: 16, fontWeight: '600' }}>Sign In</Text>}
        </Pressable>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={{ alignSelf: 'center', marginTop: 16 }}>
            <Text style={{ color: t.textMuted, fontSize: 14 }}>Forgot password?</Text>
          </Pressable>
        </Link>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: t.textMuted, fontSize: 14 }}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable><Text style={{ color: t.primary, fontSize: 14, fontWeight: '600' }}>Sign Up</Text></Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
