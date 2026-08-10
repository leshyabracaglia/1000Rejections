import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../constants/theme";
import { Card, Divider } from "./ui";

interface CounterProps {
  total: number;
  pending: number;
  rejected: number;
  accepted: number;
  streak: number;
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

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: fonts.accent,
          color: colors.text,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontFamily: fonts.regular,
          color: colors.textMuted,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function Counter({
  total,
  pending,
  rejected,
  accepted,
  streak,
}: CounterProps) {
  const resolved = rejected + accepted;
  const rejectionRate =
    resolved > 0 ? Math.round((rejected / resolved) * 100) : 0;

  return (
    <Card shadow="lg" style={{ marginHorizontal: 16, marginVertical: 12 }}>
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
            color: colors.rejection,
            letterSpacing: -1,
          }}
        >
          {rejected}
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
          {rejected === 1 ? "Rejection" : "Rejections"}
        </Text>

        <Divider width="100%" style={{ marginVertical: 16 }} />

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginBottom: 16,
          }}
        >
          <StatBox
            value={resolved > 0 ? `${rejectionRate}%` : "—"}
            label="Rejection Rate"
          />
          <View
            style={{
              width: 1,
              backgroundColor: colors.borderSubtle,
            }}
          />
          <StatBox value={streak > 0 ? `${streak}d` : "—"} label="Streak" />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <StatusDot color={colors.warning} label={`${pending} pending`} />
          <StatusDot color={colors.rejection} label={`${rejected} rejected`} />
          <StatusDot color={colors.acceptance} label={`${accepted} accepted`} />
        </View>
      </View>
    </Card>
  );
}
