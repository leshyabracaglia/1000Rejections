import React from "react";
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors, fonts } from "../../constants/theme";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  required = false,
  containerStyle,
  inputStyle,
  ...inputProps
}: TextFieldProps) {
  return (
    <View style={[{ marginBottom: 14 }, containerStyle]}>
      {label && (
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
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: colors.text,
            fontFamily: fonts.regular,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          },
          inputStyle,
        ]}
        placeholderTextColor={`${colors.textMuted}77`}
        {...inputProps}
      />
    </View>
  );
}
