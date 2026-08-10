import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'New Rejection',
          presentation: 'modal',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="rejection/[id]"
        options={{
          title: 'Edit Rejection',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#FFFFFF',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Account',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack>
  );
}
