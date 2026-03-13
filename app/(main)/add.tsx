import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { RejectionForm } from "../../components/RejectionForm";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { colors } from "../../constants/theme";

export default function AddRejectionScreen() {
  const { user } = useAuth();

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

  const handleSubmit = async (values: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  }) => {
    if (!user) {
      throw new Error("You must be logged in");
    }

    let imageUrl: string | null = null;
    if (values.imageUri) {
      imageUrl = await uploadImage(values.imageUri);
    }

    const { error } = await supabase.from("rejections").insert({
      user_id: user.id,
      title: values.title,
      description: values.description || null,
      date: values.date.toISOString().split("T")[0],
      image_url: imageUrl,
      status: "pending",
    });

    if (error) {
      throw new Error(error.message);
    }

    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RejectionForm onSubmit={handleSubmit} submitLabel="Add Event" />
    </View>
  );
}
