import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors, fonts } from "../constants/theme";
import { MultiLineChartData } from "../lib/chartUtils";

export interface ChartDataPoint {
  label: string;
  count: number;
}

interface RejectionChartProps {
  data: MultiLineChartData;
}

const screenWidth = Dimensions.get("window").width;

export function RejectionChart({ data }: RejectionChartProps) {
  const hasData =
    data.rejections.some((v) => v > 0) ||
    data.acceptances.some((v) => v > 0) ||
    data.pending.some((v) => v > 0);
  if (!hasData) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: fonts.bold,
          color: colors.textMuted,
          marginBottom: 4,
        }}
      >
        Results Over Time
      </Text>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 12,
              height: 3,
              borderRadius: 2,
              backgroundColor: colors.primary,
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
              height: 3,
              borderRadius: 2,
              backgroundColor: colors.success,
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
              height: 3,
              borderRadius: 2,
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
              color: () => colors.primary,
              strokeWidth: 2,
            },
            {
              data: data.acceptances,
              color: () => colors.success,
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
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          color: () => colors.textMuted,
          labelColor: () => colors.textMuted,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            fill: colors.surface,
          },
          decimalPlaces: 0,
          propsForBackgroundLines: {
            stroke: colors.surfaceLight,
            strokeDasharray: "",
          },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
