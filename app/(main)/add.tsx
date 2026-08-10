import React from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <RejectionForm onSubmit={handleSubmit} submitLabel="Add Event" />
    </SafeAreaView>
  );
}
