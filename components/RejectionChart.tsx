import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors, fonts } from "../constants/theme";
import { MultiLineChartData } from "../lib/chartUtils";
import { Card } from "./ui";

export interface ChartDataPoint {
  label: string;
  count: number;
}

interface RejectionChartProps {
  data: MultiLineChartData;
}

export function RejectionChart({ data }: RejectionChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const hasData =
    data.rejections.some((v) => v > 0) ||
    data.acceptances.some((v) => v > 0) ||
    data.pending.some((v) => v > 0);
  if (!hasData) return null;

  return (
    <Card
      shadow="sm"
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontFamily: fonts.accent,
          color: colors.textMuted,
          marginBottom: 8,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        Rejection Progress
      </Text>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 12,
              height: 2,
              borderRadius: 1,
              backgroundColor: colors.rejection,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: fonts.regular,
              color: colors.textMuted,
            }}
          >
            Rejections
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 12,
              height: 2,
              borderRadius: 1,
              backgroundColor: colors.acceptance,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: fonts.regular,
              color: colors.textMuted,
            }}
          >
            Acceptances
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 12,
              height: 2,
              borderRadius: 1,
              backgroundColor: colors.warning,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: fonts.regular,
              color: colors.textMuted,
            }}
          >
            Pending
          </Text>
        </View>
      </View>
      <LineChart
        data={{
          labels: data.labels,
          datasets: [
            {
              data: data.rejections,
              color: () => colors.rejection,
              strokeWidth: 2,
            },
            {
              data: data.acceptances,
              color: () => colors.acceptance,
              strokeWidth: 2,
            },
            {
              data: data.pending,
              color: () => colors.warning,
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 96}
        height={180}
        withDots
        withInnerLines={false}
        withOuterLines={false}
        fromZero
        chartConfig={{
          backgroundGradientFrom: colors.surfaceElevated,
          backgroundGradientTo: colors.surfaceElevated,
          color: () => colors.textMuted,
          labelColor: () => `${colors.textMuted}99`,
          propsForDots: {
            r: "3",
            strokeWidth: "1.5",
            fill: colors.surfaceElevated,
          },
          decimalPlaces: 0,
          propsForBackgroundLines: {
            stroke: colors.borderSubtle,
            strokeDasharray: "",
          },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </Card>
  );
}
