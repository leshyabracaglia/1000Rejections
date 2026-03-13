import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../constants/theme";

type ShadowSize = "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shadow?: ShadowSize;
}

const shadows: Record<ShadowSize, ViewStyle> = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function Card({ children, style, shadow = "md" }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          ...shadows[shadow],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
