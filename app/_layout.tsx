import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts, Inconsolata_400Regular, Inconsolata_700Bold } from '@expo-google-fonts/inconsolata';
import { Lato_400Regular, Lato_400Regular_Italic, Lato_700Bold } from '@expo-google-fonts/lato';
import { AuthProvider, useAuth } from '../lib/auth';
import { colors } from '../constants/theme';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [session, loading, segments]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inconsolata_400Regular,
    Inconsolata_700Bold,
    Lato_400Regular,
    Lato_400Regular_Italic,
    Lato_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
