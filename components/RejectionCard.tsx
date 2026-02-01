import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { Rejection } from '../types';

interface RejectionCardProps {
  rejection: Rejection;
  onPress: () => void;
  onDelete: () => void;
}

export function RejectionCard({ rejection, onPress, onDelete }: RejectionCardProps) {
  const formattedDate = new Date(rejection.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleLongPress = () => {
    Alert.alert(
      'Delete Rejection',
      'Are you sure you want to delete this rejection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={handleLongPress}
    >
      {rejection.image_url && (
        <Image source={{ uri: rejection.image_url }} style={styles.thumbnail} />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {rejection.title}
        </Text>
        {rejection.description && (
          <Text style={styles.description} numberOfLines={2}>
            {rejection.description}
          </Text>
        )}
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.onSurface,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
