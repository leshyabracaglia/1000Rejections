import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth";
import { Rejection, RejectionStatus } from "../../types";
import { Counter } from "../../components/Counter";
import { RejectionCard } from "../../components/RejectionCard";
import { LoadingScreen } from "../../components/LoadingScreen";
import { RejectionChart } from "../../components/RejectionChart";
import { EmptyStateOnboarding } from "../../components/EmptyStateOnboarding";
import { aggregateByMonthMulti } from "../../lib/chartUtils";
import { colors, fonts } from "../../constants/theme";
import { Button } from "../../components/ui";
import { useRejections } from "../../hooks/useRejections";

function calculateStreak(rejections: Rejection[]): number {
  if (rejections.length === 0) return 0;

  const datesWithEntries = new Set(rejections.map((r) => r.date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const todayStr = fmt(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = fmt(yesterday);

  if (!datesWithEntries.has(todayStr) && !datesWithEntries.has(yesterdayStr)) {
    return 0;
  }

  const start = datesWithEntries.has(todayStr) ? today : yesterday;
  let streak = 0;
  const cursor = new Date(start);

  while (datesWithEntries.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function HomeScreen() {
  const { signOut } = useAuth();
  const {
    fetchAllRejections,
    removeRejection,
    updateRejectionStatus,
    fetchPercentile,
  } = useRejections();

  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [loading, setLoading] = useState(true);
  const [percentile, setPercentile] = useState<number | null>(null);

  const chartData = useMemo(
    () => aggregateByMonthMulti(rejections, 6),
    [rejections],
  );

  const {
    pending: pendingCount,
    rejected: rejectedCount,
    accepted: acceptedCount,
  } = useMemo(() => {
    const acc = { pending: 0, rejected: 0, accepted: 0 };
    for (const r of rejections) acc[r.status]++;
    return acc;
  }, [rejections]);

  const streak = useMemo(() => calculateStreak(rejections), [rejections]);

  const loadRejections = useCallback(async () => {
    const data = await fetchAllRejections();
    setRejections(data);
    setLoading(false);
    const pct = await fetchPercentile(data.length);
    setPercentile(pct);
  }, [fetchAllRejections, fetchPercentile]);

  useFocusEffect(
    useCallback(() => {
      loadRejections();
    }, [loadRejections]),
  );

  const handleDelete = async (id: string) => {
    const success = await removeRejection(id);
    if (success) {
      setRejections((prev) => prev.filter((r) => r.id !== id));
    } else {
      Alert.alert("Error", "Failed to delete event");
    }
  };

  const handleStatusChange = async (id: string, status: RejectionStatus) => {
    const success = await updateRejectionStatus(id, status);
    if (success) {
      setRejections((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } else {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontFamily: fonts.accent,
            color: colors.primary,
            letterSpacing: 0.5,
          }}
        >
          1000 Rejections
        </Text>
        <Button
          label="Sign Out"
          variant="ghost"
          onPress={handleSignOut}
          style={{ paddingVertical: 6, paddingHorizontal: 14, padding: 0 }}
          textStyle={{ fontSize: 13 }}
          testID="sign-out-button"
        />
      </View>

      <FlatList
        data={rejections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RejectionCard
            rejection={item}
            onPress={() => router.push(`/(main)/rejection/${item.id}`)}
            onDelete={() => handleDelete(item.id)}
            onStatusChange={(status) => handleStatusChange(item.id, status)}
          />
        )}
        ListHeaderComponent={
          rejections.length > 0 ? (
            <>
              <Counter
                total={rejections.length}
                pending={pendingCount}
                rejected={rejectedCount}
                accepted={acceptedCount}
                streak={streak}
              />
              <RejectionChart data={chartData} />
              {acceptedCount > 0 && rejectedCount < acceptedCount && (
                <View
                  style={{
                    marginHorizontal: 16,
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: `${colors.warning}10`,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${colors.warning}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: fonts.bold,
                      color: colors.warning,
                      textAlign: "center",
                      letterSpacing: -0.2,
                    }}
                  >
                    You're not getting rejected enough!
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: fonts.regular,
                      color: `${colors.textMuted}CC`,
                      textAlign: "center",
                      marginTop: 4,
                      lineHeight: 20,
                    }}
                  >
                    Do things more outside of the box. Take bigger swings!
                  </Text>
                </View>
              )}
              {percentile !== null && percentile >= 50 && (
                <View
                  style={{
                    marginHorizontal: 16,
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: colors.celebration,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${colors.rejection}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: fonts.bold,
                      color: colors.rejection,
                      textAlign: "center",
                      letterSpacing: -0.2,
                    }}
                  >
                    You're in the top {100 - percentile}% of rejection
                    collectors!
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: fonts.regular,
                      color: colors.text,
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    Keep putting yourself out there!
                  </Text>
                </View>
              )}
            </>
          ) : null
        }
        ListEmptyComponent={
          <EmptyStateOnboarding onAddFirst={() => router.push("/(main)/add")} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Pressable
        style={({ pressed }) => ({
          position: "absolute",
          right: 20,
          bottom: 36,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 14,
          paddingHorizontal: 22,
          borderRadius: 28,
          backgroundColor: colors.rejection,
          shadowColor: colors.rejection,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 10,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
        onPress={() => router.push("/(main)/add")}
        testID="add-rejection-button"
        accessibilityRole="button"
        accessibilityLabel="Get Rejected"
      >
        <Text
          style={{
            fontSize: 22,
            color: "#000",
            fontWeight: "300",
            marginTop: -1,
          }}
        >
          +
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: fonts.bold,
            color: "#000",
            letterSpacing: 0.3,
          }}
        >
          Get Rejected
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
