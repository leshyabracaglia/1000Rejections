import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inconsolata_400Regular, Inconsolata_700Bold } from '@expo-google-fonts/inconsolata';
import { Lato_400Regular, Lato_400Regular_Italic, Lato_700Bold } from '@expo-google-fonts/lato';
import { AuthProvider, useAuth } from '../lib/auth';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { colors } from '../constants/theme';
import { ROUTES } from '../constants/routes';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    // The reset-password screen establishes a session from the recovery
    // link on purpose -- don't bounce the user into the main app before
    // they've had a chance to set a new password.
    const isResetPasswordScreen =
      `/(auth)/${(segments as string[])[1]}` === ROUTES.RESET_PASSWORD;
    if (!session && !inAuthGroup) {
      router.replace(ROUTES.LOGIN);
    } else if (session && inAuthGroup && !isResetPasswordScreen) {
      router.replace(ROUTES.MAIN);
    }
  }, [session, loading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </GestureHandlerRootView>
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
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
