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

  // Counts are always whole numbers, but react-native-chart-kit's default
  // of 4 segments divides the range into fractional steps regardless (e.g.
  // a max of 1 produces y-axis labels 0, 0.25, 0.5, 0.75, 1 -- which all
  // round to 0/1 with decimalPlaces: 0, showing as "0, 0, 1, 1, 1"). Capping
  // segments at the actual max value keeps every label a whole number.
  // segments must stay >= 2: react-native-chart-kit has a special (and
  // broken) case for segments === 1 that renders a single mislabeled tick
  // instead of a proper 0..max scale (see AbstractChart.renderHorizontalLabels).
  const maxValue = Math.max(
    1,
    ...data.rejections,
    ...data.acceptances,
    ...data.pending,
  );
  const segments = Math.min(4, Math.max(2, maxValue));

  // With a small max value (e.g. 1) and segments floored at 2, the middle
  // label (max / 2, rounded) can round to the same integer as the top label
  // -- e.g. max=1 produces "0", "1", "1", rendered bottom-to-top. The top
  // occurrence is the one that matters (it's exact, and it's where the data
  // line actually reaches), so the *earlier* duplicate must be hidden, not
  // the later one. formatYLabel has no lookahead, so the exact sequence
  // chart-kit will produce is precomputed here to know which occurrence is
  // last.
  const labelSequence = Array.from({ length: segments + 1 }, (_, i) =>
    ((maxValue / segments) * i).toFixed(0),
  );
  let labelCallIndex = 0;
  const formatYLabel = (label: string) => {
    const index = labelCallIndex++;
    const repeatsLater = labelSequence.slice(index + 1).includes(labelSequence[index]);
    return repeatsLater ? "" : label;
  };

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
        segments={segments}
        formatYLabel={formatYLabel}
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
