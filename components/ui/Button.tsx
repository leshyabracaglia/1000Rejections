import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { colors, fonts } from "../../constants/theme";

type ButtonVariant = "primary" | "outline" | "danger" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const variantStyles: Record<
  ButtonVariant,
  {
    bg: string;
    bgPressed: string;
    border: string;
    borderPressed: string;
    text: string;
    shadow: boolean;
  }
> = {
  primary: {
    bg: colors.primary,
    bgPressed: colors.primary,
    border: "transparent",
    borderPressed: "transparent",
    text: colors.onPrimary,
    shadow: true,
  },
  outline: {
    bg: "transparent",
    bgPressed: `${colors.primary}10`,
    border: colors.borderSubtle,
    borderPressed: colors.primary,
    text: colors.text,
    shadow: false,
  },
  danger: {
    bg: "transparent",
    bgPressed: `${colors.error}10`,
    border: `${colors.error}50`,
    borderPressed: colors.error,
    text: colors.error,
    shadow: false,
  },
  ghost: {
    bg: colors.surfaceElevated,
    bgPressed: colors.surfaceLight,
    border: colors.borderSubtle,
    borderPressed: colors.border,
    text: colors.textMuted,
    shadow: false,
  },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const v = variantStyles[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: 14,
          padding: 18,
          alignItems: "center" as const,
          backgroundColor: pressed ? v.bgPressed : v.bg,
          borderWidth: 1,
          borderColor: pressed ? v.borderPressed : v.border,
          opacity: loading || disabled ? 0.6 : pressed ? 0.9 : 1,
          ...(v.shadow
            ? {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }
            : {}),
        },
        style,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.onPrimary : v.text}
        />
      ) : (
        <Text
          style={[
            {
              fontSize: 16,
              fontFamily: fonts.bold,
              color: v.text,
              letterSpacing: 0.3,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
