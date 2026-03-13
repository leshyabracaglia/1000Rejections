import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../constants/theme";

interface DividerProps {
  style?: StyleProp<ViewStyle>;
  width?: number | string;
}

export function Divider({ style, width = "100%" }: DividerProps) {
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: colors.borderSubtle,
          alignSelf: "center",
          width: width as any,
        },
        style,
      ]}
    >
    </View>
  );
}
