import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  RejectionForm,
  RejectionFormValues,
} from "../../../components/RejectionForm";
import { Rejection, RejectionStatus } from "../../../types";
import { colors, fonts } from "../../../constants/theme";
import { Button, FormField } from "../../../components/ui";
import { useRejections } from "../../../hooks/useRejections";

const statusColors: Record<RejectionStatus, string> = {
  pending: colors.warning,
  rejected: colors.rejection,
  accepted: colors.acceptance,
};

export default function EditRejectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    fetchRejectionById,
    updateRejection,
    removeRejection,
    updateRejectionStatus,
  } = useRejections();

  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchRejectionById(id).then((data) => {
      if (!data) {
        Alert.alert("Error", "Failed to load event");
        router.back();
      } else {
        setRejection(data);
      }
      setLoading(false);
    });
  }, [id, fetchRejectionById]);

  const handleStatusChange = async (newStatus: RejectionStatus) => {
    if (!rejection) return;

    const oldStatus = rejection.status;

    setRejection({ ...rejection, status: newStatus });
    const success = await updateRejectionStatus(rejection.id, newStatus);

    if (!success) {
      setRejection({ ...rejection, status: oldStatus });
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleSubmit = async (values: RejectionFormValues) => {
    if (!rejection) throw new Error("Invalid state");
    await updateRejection(rejection.id, {
      ...values,
      status: rejection.status,
    });
    router.back();
  };

  const handleDelete = () =>
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await removeRejection(rejection?.id ?? "");
          if (success) router.back();
          else Alert.alert("Error", "Failed to delete event");
        },
      },
    ]);

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  if (!rejection) return null;

  const currentStatus = rejection.status ?? "rejected";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <FormField label="Status">
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["pending", "rejected", "accepted"] as const).map((s) => {
              const isActive = currentStatus === s;
              const color = statusColors[s];
              return (
                <Pressable
                  key={s}
                  accessibilityRole="button"
                  testID={`status-${s}`}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: isActive ? `${color}15` : "transparent",
                    borderWidth: 1,
                    borderColor: isActive ? `${color}50` : colors.borderSubtle,
                    alignItems: "center",
                    opacity: pressed ? 0.85 : 1,
                  })}
                  onPress={() => handleStatusChange(s)}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.bold,
                      color: isActive ? color : `${colors.textMuted}88`,
                      letterSpacing: 0.2,
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FormField>
      </View>
      <RejectionForm
        initialValues={{
          title: rejection.title,
          description: rejection.description,
          date: rejection.date,
          image_url: rejection.image_url,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
      <Button
        label="Delete Event"
        variant="danger"
        onPress={handleDelete}
        style={{ marginHorizontal: 16, marginBottom: 32, marginTop: 0 }}
        textStyle={{ fontSize: 15 }}
      />
    </View>
  );
}
