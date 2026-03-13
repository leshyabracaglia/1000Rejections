import React from "react";
import { View, Text, Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, fonts } from "../constants/theme";
import { FormField } from "./ui";

interface ImagePickerButtonProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export function ImagePickerButton({
  imageUri,
  onImageSelected,
}: ImagePickerButtonProps) {
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant photo library access to add images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera access to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const showOptions = () => {
    Alert.alert("Add Image", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      ...(imageUri
        ? [
            {
              text: "Remove Image",
              style: "destructive" as const,
              onPress: () => onImageSelected(null),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  return (
    <FormField label="Image (optional)" style={{ marginBottom: 16 }}>
      <Pressable
        style={({ pressed }) => ({
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderStyle: imageUri ? ("solid" as const) : ("dashed" as const),
          borderColor: imageUri ? colors.borderSubtle : colors.border,
          opacity: pressed ? 0.85 : 1,
        })}
        onPress={showOptions}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: 208 }}
          />
        ) : (
          <View
            style={{
              height: 120,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: `${colors.textMuted}66`,
              }}
            >
              +
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: fonts.regular,
                color: `${colors.textMuted}88`,
                marginTop: 4,
              }}
            >
              Add Image
            </Text>
          </View>
        )}
      </Pressable>
    </FormField>
  );
}
