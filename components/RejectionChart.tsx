import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, fonts } from '../constants/theme';

export interface ChartDataPoint {
  label: string;
  count: number;
}

interface RejectionChartProps {
  data: ChartDataPoint[];
}

const screenWidth = Dimensions.get('window').width;

export function RejectionChart({ data }: RejectionChartProps) {
  if (data.length === 0) return null;

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
      <Text style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.textMuted, marginBottom: 12 }}>
        Rejections Over Time
      </Text>
      <LineChart
        data={{
          labels: data.map((d) => d.label),
          datasets: [{ data: data.map((d) => d.count) }],
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
          color: () => colors.primary,
          labelColor: () => colors.textMuted,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
            fill: colors.surface,
          },
          decimalPlaces: 0,
          propsForBackgroundLines: {
            stroke: colors.surfaceLight,
            strokeDasharray: '',
          },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
