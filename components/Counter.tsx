import React from 'react';
import { View, Text } from 'react-native';
import { colors, fonts } from '../constants/theme';

interface CounterProps {
  count: number;
}

export function Counter({ count }: CounterProps) {
  return (
    <View style={{
      marginHorizontal: 16,
      marginVertical: 10,
      borderRadius: 16,
      backgroundColor: '#0D0D0D',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    }}>
      <View style={{
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: '#242424',
        borderRadius: 16,
        borderTopWidth: 1,
        borderTopColor: '#333333',
        borderBottomWidth: 2,
        borderBottomColor: '#0A0A0A',
      }}>
        <Text style={{ fontSize: 48, fontFamily: fonts.accent, color: colors.primary, letterSpacing: -1 }}>
          {count}
        </Text>
        <Text style={{ fontSize: 15, fontFamily: fonts.regular, color: colors.textMuted, marginTop: 6 }}>
          Total Rejections
        </Text>
      </View>
    </View>
  );
}
