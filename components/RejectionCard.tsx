import React from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { Rejection } from '../types';

const t = { surface: '#1E1E1E', primary: '#BB86FC', text: '#FFFFFF', textMuted: '#B3B3B3' };

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
    <Pressable
      style={({ pressed }) => ({ flexDirection: 'row', backgroundColor: t.surface, borderRadius: 12, marginHorizontal: 16, marginVertical: 4, padding: 16, opacity: pressed ? 0.7 : 1 })}
      onPress={onPress}
      onLongPress={handleLongPress}
    >
      {rejection.image_url && (
        <Image source={{ uri: rejection.image_url }} style={{ width: 64, height: 64, borderRadius: 8, marginRight: 16 }} />
      )}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.text }} numberOfLines={1}>
          {rejection.title}
        </Text>
        {rejection.description && (
          <Text style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }} numberOfLines={2}>
            {rejection.description}
          </Text>
        )}
        <Text style={{ fontSize: 12, color: t.primary, marginTop: 4 }}>{formattedDate}</Text>
      </View>
    </Pressable>
  );
}
