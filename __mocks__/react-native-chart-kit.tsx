import React from 'react';
import { View } from 'react-native';

export const LineChart = (props: any) => (
  <View
    testID="line-chart"
    {...({
      segments: props.segments,
      formatYLabel: props.formatYLabel,
    })}
  />
);
export const BarChart = (props: any) => <View testID="bar-chart" />;
export const PieChart = (props: any) => <View testID="pie-chart" />;
