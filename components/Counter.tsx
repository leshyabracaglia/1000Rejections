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
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
      <Text style={{ fontSize: 13, fontFamily: fonts.regular, color }}>
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
        marginVertical: 10,
        borderRadius: 16,
        backgroundColor: "#0D0D0D",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <View
        style={{
          alignItems: "center",
          paddingVertical: 24,
          paddingHorizontal: 20,
          backgroundColor: "#242424",
          borderRadius: 16,
          borderTopWidth: 1,
          borderTopColor: "#333333",
          borderBottomWidth: 2,
          borderBottomColor: "#0A0A0A",
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
            fontSize: 15,
            fontFamily: fonts.regular,
            color: colors.textMuted,
            marginTop: 6,
          }}
        >
          Total Events
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginTop: 12,
            gap: 16,
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
