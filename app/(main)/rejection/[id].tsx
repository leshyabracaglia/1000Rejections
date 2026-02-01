import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { colors } from '../../../constants/theme';
import { RejectionForm } from '../../../components/RejectionForm';
import { Rejection } from '../../../types';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export default function EditRejectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejection();
  }, [id]);

  const fetchRejection = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('rejections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Error', 'Failed to load rejection');
      router.back();
    } else {
      setRejection(data);
    }
    setLoading(false);
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

      const { error } = await supabase.storage
        .from('rejection-images')
        .upload(fileName, decode(base64), {
          contentType,
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('rejection-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    date: Date;
    imageUri: string | null;
  }) => {
    if (!user || !rejection) {
      throw new Error('Invalid state');
    }

    let imageUrl: string | null = rejection.image_url;

    // Check if image changed
    if (values.imageUri !== rejection.image_url) {
      if (values.imageUri && !values.imageUri.startsWith('http')) {
        // New local image to upload
        imageUrl = await uploadImage(values.imageUri);
      } else {
        // Image removed or already a URL
        imageUrl = values.imageUri;
      }
    }

    const { error } = await supabase
      .from('rejections')
      .update({
        title: values.title,
        description: values.description || null,
        date: values.date.toISOString().split('T')[0],
        image_url: imageUrl,
      })
      .eq('id', rejection.id);

    if (error) {
      throw new Error(error.message);
    }

    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!rejection) {
    return null;
  }

  return (
    <View style={styles.container}>
      <RejectionForm
        initialValues={{
          title: rejection.title,
          description: rejection.description || '',
          date: new Date(rejection.date),
          imageUri: rejection.image_url,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
