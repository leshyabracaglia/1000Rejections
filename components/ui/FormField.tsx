import React from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { colors, fonts } from "../../constants/theme";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function FormField({
  label,
  required = false,
  children,
  style,
}: FormFieldProps) {
  return (
    <View style={[{ marginBottom: 20 }, style]}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: fonts.accent,
          color: colors.textMuted,
          marginBottom: 8,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
        {required ? " *" : ""}
      </Text>
      {children}
    </View>
  );
}
