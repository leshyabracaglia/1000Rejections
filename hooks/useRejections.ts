import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Rejection, RejectionStatus, normalizeRejection } from "../types";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { RejectionFormValues } from "../components/RejectionForm";

export function useRejections() {
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
        .upload(fileName, decode(base64), { contentType });

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

  const resolveImageUrl = async (
    imageUri: string | null,
    currentUrl: string | null,
  ): Promise<string | null> => {
    if (imageUri === currentUrl) return currentUrl;
    if (!imageUri) return null;
    if (imageUri.startsWith("http")) return imageUri;
    return uploadImage(imageUri);
  };

  const fetchAllRejections = useCallback(async (): Promise<Rejection[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("rejections")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching rejections:", error);
      return [];
    }

    return (data || []).map(normalizeRejection);
  }, [user]);

  const fetchRejectionById = useCallback(
    async (id: string): Promise<Rejection | null> => {
      const { data, error } = await supabase
        .from("rejections")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return null;
      return normalizeRejection(data);
    },
    [],
  );

  const createRejection = async (values: RejectionFormValues) => {
    if (!user) throw new Error("You must be logged in");

    const imageUrl = await resolveImageUrl(values.image_url, null);

    const { error } = await supabase.from("rejections").insert({
      user_id: user.id,
      title: values.title.trim(),
      description: values.description?.trim() || null,
      date: values.date,
      image_url: imageUrl,
      status: "pending",
    });

    if (error) throw new Error(error.message);
  };

  const updateRejection = async (
    id: string,
    updates: Partial<RejectionFormValues> & { status?: RejectionStatus },
  ) => {
    if (!user) throw new Error("You must be logged in");

    const payload = { ...updates };
    if (payload.image_url && !payload.image_url.startsWith("http")) {
      payload.image_url = (await uploadImage(payload.image_url)) ?? null;
    }

    const { error } = await supabase
      .from("rejections")
      .update(payload)
      .eq("id", id);

    if (error) throw new Error(error.message);
  };

  const removeRejection = async (id: string) => {
    const { error } = await supabase
      .from("rejections")
      .delete()
      .eq("id", id);

    return !error;
  };

  const updateRejectionStatus = async (id: string, status: RejectionStatus) => {
    const { error } = await supabase
      .from("rejections")
      .update({ status })
      .eq("id", id);

    return !error;
  };

  const fetchPercentile = useCallback(
    async (myCount: number): Promise<number | null> => {
      if (myCount === 0) return null;

      const { data, error } = await supabase
        .from("rejections")
        .select("user_id");

      if (error || !data) return null;

      const userCounts: Record<string, number> = {};
      data.forEach((r) => {
        userCounts[r.user_id] = (userCounts[r.user_id] || 0) + 1;
      });

      const counts = Object.values(userCounts);
      const usersWithFewer = counts.filter((c) => c < myCount).length;
      return Math.round((usersWithFewer / counts.length) * 100);
    },
    [],
  );

  return {
    fetchAllRejections,
    fetchRejectionById,
    createRejection,
    updateRejection,
    removeRejection,
    updateRejectionStatus,
    fetchPercentile,
  };
}
