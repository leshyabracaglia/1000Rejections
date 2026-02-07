import React from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { Rejection } from '../types';
import { colors, fonts } from '../constants/theme';

interface RejectionCardProps {
  rejection: Rejection;
  onPress: () => void;
  onDelete: () => void;
}

export function RejectionCard({ rejection, onPress, onDelete }: RejectionCardProps) {
  const formattedDate = new Date(rejection.date + 'T00:00:00').toLocaleDateString('en-US', {
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
    <View style={{
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      backgroundColor: '#0D0D0D',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
    }}>
      <Pressable
        style={({ pressed }) => ({
          flexDirection: 'row',
          backgroundColor: '#242424',
          borderRadius: 12,
          padding: 16,
          opacity: pressed ? 0.7 : 1,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
          borderTopWidth: 1,
          borderTopColor: '#333333',
          borderBottomWidth: 2,
          borderBottomColor: '#0A0A0A',
        })}
        onPress={onPress}
        onLongPress={handleLongPress}
      >
        {rejection.image_url && (
          <Image source={{ uri: rejection.image_url }} style={{ width: 64, height: 64, borderRadius: 8, marginRight: 16 }} />
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontFamily: fonts.bold, color: colors.text }} numberOfLines={1}>
            {rejection.title}
          </Text>
          {rejection.description && (
            <Text style={{ fontSize: 14, fontFamily: fonts.regular, color: colors.textMuted, marginTop: 4 }} numberOfLines={2}>
              {rejection.description}
            </Text>
          )}
          <Text style={{ fontSize: 12, fontFamily: fonts.accentRegular, color: colors.primary, marginTop: 6 }}>{formattedDate}</Text>
        </View>
      </Pressable>
    </View>
  );
}
