import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";
import { RejectionForm } from "../../../components/RejectionForm";
import { Rejection, RejectionStatus, normalizeRejection } from "../../../types";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { colors, fonts } from "../../../constants/theme";

const statusColors: Record<RejectionStatus, string> = {
  pending: colors.warning,
  rejected: colors.primary,
  accepted: colors.success,
};

export default function EditRejectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejection();
  }, [id]);

  const fetchRejection = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("rejections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Error", "Failed to load event");
      router.back();
    } else {
      setRejection(normalizeRejection(data));
    }
    setLoading(false);
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const contentType = fileExt === "png" ? "image/png" : "image/jpeg";

      const { error } = await supabase.storage
        .from("rejection-images")
        .upload(fileName, decode(base64), {
          contentType,
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("rejection-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleStatusChange = async (newStatus: RejectionStatus) => {
    if (!rejection) return;

    const { error } = await supabase
      .from("rejections")
      .update({ status: newStatus })
      .eq("id", rejection.id);

    if (!error) {
      setRejection({ ...rejection, status: newStatus });
    } else {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  }) => {
    if (!user || !rejection) {
      throw new Error("Invalid state");
    }

    let imageUrl: string | null = rejection.image_url;

    if (values.imageUri !== rejection.image_url) {
      if (values.imageUri && !values.imageUri.startsWith("http")) {
        imageUrl = await uploadImage(values.imageUri);
      } else {
        imageUrl = values.imageUri;
      }
    }

    const { error } = await supabase
      .from("rejections")
      .update({
        title: values.title,
        description: values.description || null,
        date: values.date.toISOString().split("T")[0],
        image_url: imageUrl,
      })
      .eq("id", rejection.id);

    if (error) {
      throw new Error(error.message);
    }

    router.back();
  };

  const handleDelete = () =>
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("rejections")
            .delete()
            .eq("id", rejection?.id);
          if (error) Alert.alert("Error", "Failed to delete");
          else router.back();
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
        <Text
          style={{
            fontSize: 12,
            fontFamily: fonts.accent,
            color: colors.textMuted,
            marginBottom: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Status
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["pending", "rejected", "accepted"] as const).map((s) => {
            const isActive = currentStatus === s;
            const color = statusColors[s];
            return (
              <Pressable
                key={s}
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
      </View>
      <RejectionForm
        initialValues={{
          title: rejection.title,
          description: rejection.description || "",
          date: new Date(rejection.date),
          imageUri: rejection.image_url,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
      <Pressable
        style={({ pressed }) => ({
          marginHorizontal: 16,
          marginBottom: 32,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: pressed ? colors.error : `${colors.error}50`,
          backgroundColor: pressed ? `${colors.error}10` : "transparent",
          alignItems: "center",
        })}
        onPress={handleDelete}
      >
        <Text
          style={{
            color: colors.error,
            fontSize: 15,
            fontFamily: fonts.bold,
            letterSpacing: 0.2,
          }}
        >
          Delete Event
        </Text>
      </Pressable>
    </View>
  );
}
