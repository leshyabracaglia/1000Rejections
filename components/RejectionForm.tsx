import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ImagePickerButton } from './ImagePickerButton';

const t = { surface: '#1E1E1E', primary: '#BB86FC', text: '#FFFFFF', textMuted: '#B3B3B3', border: '#333333', error: '#CF6679', onPrimary: '#000000' };

interface RejectionFormProps {
  initialValues?: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  };
  onSubmit: (values: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  }) => Promise<void>;
  submitLabel: string;
}

export function RejectionForm({ initialValues, onSubmit, submitLabel }: RejectionFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [date, setDate] = useState(initialValues?.date ?? new Date());
  const [imageUri, setImageUri] = useState<string | null>(initialValues?.imageUri ?? null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({ title: title.trim(), description: description.trim(), date, imageUri });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: t.textMuted, marginBottom: 8 }}>Title *</Text>
        <TextInput
          style={{ backgroundColor: t.surface, borderRadius: 12, padding: 16, fontSize: 16, color: t.text, borderWidth: 1, borderColor: t.border }}
          value={title}
          onChangeText={setTitle}
          placeholder="What were you rejected from?"
          placeholderTextColor={t.textMuted}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: t.textMuted, marginBottom: 8 }}>Description</Text>
        <TextInput
          style={{ backgroundColor: t.surface, borderRadius: 12, padding: 16, fontSize: 16, color: t.text, borderWidth: 1, borderColor: t.border, minHeight: 100 }}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell the story of this rejection..."
          placeholderTextColor={t.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: t.textMuted, marginBottom: 8 }}>Date</Text>
        <Pressable
          style={{ backgroundColor: t.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: t.border }}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ fontSize: 16, color: t.text }}>{formattedDate}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
            themeVariant="dark"
          />
        )}
      </View>

      <ImagePickerButton imageUri={imageUri} onImageSelected={setImageUri} />

      {error && <Text style={{ color: t.error, fontSize: 14, marginBottom: 16 }}>{error}</Text>}

      <Pressable
        style={({ pressed }) => ({ backgroundColor: t.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 32, opacity: loading ? 0.6 : pressed ? 0.8 : 1 })}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={t.onPrimary} />
        ) : (
          <Text style={{ color: t.onPrimary, fontSize: 16, fontWeight: '600' }}>{submitLabel}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
