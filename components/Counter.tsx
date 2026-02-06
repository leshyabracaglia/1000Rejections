import React from 'react';
import { View, Text } from 'react-native';

const t = { surface: '#1E1E1E', primary: '#BB86FC', text: '#FFFFFF', textMuted: '#B3B3B3', surfaceLight: '#2D2D2D' };

interface CounterProps {
  count: number;
  goal?: number;
}

export function Counter({ count, goal = 1000 }: CounterProps) {
  const progress = Math.min(count / goal, 1);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, backgroundColor: t.surface, borderRadius: 16, marginHorizontal: 16, marginVertical: 16 }}>
      <Text>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: t.primary }}>{count}</Text>
        <Text style={{ fontSize: 48, color: t.textMuted }}> / </Text>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: t.text }}>{goal}</Text>
      </Text>
      <Text style={{ fontSize: 16, color: t.textMuted, marginTop: 4 }}>rejections this year</Text>
      <View style={{ width: '100%', height: 8, backgroundColor: t.surfaceLight, borderRadius: 4, marginTop: 24, overflow: 'hidden' }}>
        <View style={{ height: '100%', backgroundColor: t.primary, borderRadius: 4, width: `${progress * 100}%` }} />
      </View>
      <Text style={{ fontSize: 14, color: t.textMuted, marginTop: 8 }}>
        {Math.round(progress * 100)}% complete
      </Text>
    </View>
  );
}
