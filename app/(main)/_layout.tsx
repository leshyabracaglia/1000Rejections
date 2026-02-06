import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
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
    </Stack>
  );
}
