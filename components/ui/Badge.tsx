import React from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { fonts } from "../../constants/theme";

interface BadgeProps {
  label: string;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, color, style }: BadgeProps) {
  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 6,
          backgroundColor: `${color}15`,
          borderWidth: 1,
          borderColor: `${color}25`,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 11,
          fontFamily: fonts.bold,
          color,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
