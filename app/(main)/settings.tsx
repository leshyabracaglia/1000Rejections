import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth";
import { colors, fonts } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";
import { Button, Card } from "../../components/ui";

export default function SettingsScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace(ROUTES.LOGIN);
        },
      },
    ]);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all of your rejections and photos. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      Alert.alert(
        "Error",
        `Failed to delete your account. Please try again.\n\n${error.message}`,
      );
      return;
    }
    router.replace(ROUTES.LOGIN);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <View style={{ padding: 20, gap: 20 }}>
        <Card style={{ padding: 16 }}>
          <Text
            style={{
              fontFamily: fonts.regular,
              color: colors.textMuted,
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Signed in as
          </Text>
          <Text
            style={{
              fontFamily: fonts.bold,
              color: colors.text,
              fontSize: 16,
            }}
          >
            {user?.email ?? "Unknown"}
          </Text>
        </Card>

        <Button
          label="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          testID="settings-sign-out-button"
        />

        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              color: colors.error,
              fontSize: 15,
              marginBottom: 8,
            }}
          >
            Danger Zone
          </Text>
          <Text
            style={{
              fontFamily: fonts.regular,
              color: colors.textMuted,
              fontSize: 13,
              marginBottom: 14,
              lineHeight: 18,
            }}
          >
            Deleting your account permanently removes your profile and every
            rejection you've logged, including attached photos. This action
            cannot be undone.
          </Text>
          <Button
            label="Delete Account"
            variant="danger"
            loading={deleting}
            onPress={confirmDeleteAccount}
            testID="delete-account-button"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
