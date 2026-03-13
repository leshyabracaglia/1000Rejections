import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../constants/theme";

interface CounterProps {
  total: number;
  pending: number;
  rejected: number;
  accepted: number;
}

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontSize: 13,
          fontFamily: fonts.regular,
          color: colors.textMuted,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function Counter({ total, pending, rejected, accepted }: CounterProps) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 16,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <View
        style={{
          alignItems: "center",
          paddingVertical: 28,
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            fontSize: 48,
            fontFamily: fonts.accent,
            color: colors.primary,
            letterSpacing: -1,
          }}
        >
          {total}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: fonts.regular,
            color: colors.textMuted,
            marginTop: 6,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Total Events
        </Text>
        <View
          style={{
            width: 40,
            height: 1,
            backgroundColor: colors.borderSubtle,
            marginVertical: 16,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <StatusDot color={colors.warning} label={`${pending} pending`} />
          <StatusDot color={colors.primary} label={`${rejected} rejected`} />
          <StatusDot color={colors.success} label={`${accepted} accepted`} />
        </View>
      </View>
    </View>
  );
}
