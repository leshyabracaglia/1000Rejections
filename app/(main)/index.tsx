import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { Rejection } from '../../types';
import { Counter } from '../../components/Counter';
import { RejectionCard } from '../../components/RejectionCard';

const t = { bg: '#121212', primary: '#BB86FC', text: '#FFFFFF', textMuted: '#B3B3B3', onPrimary: '#000000' };

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRejections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('rejections')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching rejections:', error);
    } else {
      setRejections(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRejections();
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRejections();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('rejections').delete().eq('id', id);

    if (error) {
      Alert.alert('Error', 'Failed to delete rejection');
    } else {
      setRejections((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={t.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: t.primary }}>1000 Rejections</Text>
        <Pressable onPress={handleSignOut} style={{ padding: 8 }}>
          <Text style={{ color: t.textMuted, fontSize: 14 }}>Sign Out</Text>
        </Pressable>
      </View>

      <FlatList
        data={rejections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RejectionCard
            rejection={item}
            onPress={() => router.push(`/(main)/rejection/${item.id}`)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListHeaderComponent={<Counter count={rejections.length} />}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: t.text, marginBottom: 8 }}>No rejections yet</Text>
            <Text style={{ fontSize: 16, color: t.textMuted, textAlign: 'center' }}>Start your journey! Add your first rejection.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRejections(); }} tintColor={t.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Pressable
        style={{ position: 'absolute', right: 24, bottom: 32, width: 64, height: 64, borderRadius: 32, backgroundColor: t.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 }}
        onPress={() => router.push('/(main)/add')}
      >
        <Text style={{ fontSize: 32, color: t.onPrimary, fontWeight: '300', marginTop: -2 }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
