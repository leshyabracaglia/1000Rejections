import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'New Rejection',
          presentation: 'modal',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: '#FFFFFF',
        }}
      />
      <Stack.Screen
        name="rejection/[id]"
        options={{
          title: 'Edit Rejection',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack>
  );
}
