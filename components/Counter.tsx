import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

interface CounterProps {
  count: number;
  goal?: number;
}

export function Counter({ count, goal = 1000 }: CounterProps) {
  const progress = Math.min(count / goal, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.count}>
        <Text style={styles.current}>{count}</Text>
        <Text style={styles.separator}> / </Text>
        <Text style={styles.goal}>{goal}</Text>
      </Text>
      <Text style={styles.label}>rejections this year</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.percentage}>{Math.round(progress * 100)}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  count: {
    flexDirection: 'row',
  },
  current: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.primary,
  },
  separator: {
    fontSize: fontSize.hero,
    color: colors.textSecondary,
  },
  goal: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  percentage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
