import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  RejectionForm,
  RejectionFormValues,
} from "../../components/RejectionForm";
import { colors } from "../../constants/theme";
import { useRejections } from "../../hooks/useRejections";

export default function AddRejectionScreen() {
  const { createRejection } = useRejections();

  const handleSubmit = async (values: RejectionFormValues) => {
    await createRejection(values);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RejectionForm onSubmit={handleSubmit} submitLabel="Add Event" />
    </View>
  );
}
