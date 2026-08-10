import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, consumeEmailJustVerifiedFlag } from "../../lib/auth";
import { IRejection, IRejectionStatus, REJECTION_STATUS } from "../../types";
import { Counter } from "../../components/Counter";
import { RejectionCard } from "../../components/RejectionCard";
import { LoadingScreen } from "../../components/LoadingScreen";
import { RejectionChart } from "../../components/RejectionChart";
import { EmptyStateOnboarding } from "../../components/EmptyStateOnboarding";
import { aggregateByMonthMulti } from "../../lib/chartUtils";
import { colors, fonts } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";
import { useRejections } from "../../hooks/useRejections";

function calculateStreak(rejections: IRejection[]): number {
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

  const [rejections, setRejections] = useState<IRejection[]>([]);
  const [loading, setLoading] = useState(true);
  const [percentile, setPercentile] = useState<number | null>(null);

  // Set by the login screen after it establishes a session from an email
  // confirmation link. The lazy initializer runs exactly once on mount, so
  // this only ever shows right after that redirect.
  const [showEmailVerifiedBanner, setShowEmailVerifiedBanner] = useState(consumeEmailJustVerifiedFlag);
  useEffect(() => {
    if (!showEmailVerifiedBanner) return;
    const timer = setTimeout(() => setShowEmailVerifiedBanner(false), 4000);
    return () => clearTimeout(timer);
  }, [showEmailVerifiedBanner]);

  const chartData = useMemo(
    () => aggregateByMonthMulti(rejections, 6),
    [rejections],
  );

  const {
    [REJECTION_STATUS.PENDING]: pendingCount,
    [REJECTION_STATUS.REJECTED]: rejectedCount,
    [REJECTION_STATUS.ACCEPTED]: acceptedCount,
  } = useMemo(() => {
    const acc: Record<IRejectionStatus, number> = { [REJECTION_STATUS.PENDING]: 0, [REJECTION_STATUS.REJECTED]: 0, [REJECTION_STATUS.ACCEPTED]: 0 };
    for (const r of rejections) acc[r.status ?? REJECTION_STATUS.REJECTED]++;
    return acc;
  }, [rejections]);

  const streak = useMemo(() => calculateStreak(rejections), [rejections]);

  const loadRejections = useCallback(async () => {
    const data = await fetchAllRejections();
    setRejections(data);
    setLoading(false);
    const userPercentile = await fetchPercentile(data.length);
    setPercentile(userPercentile);
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

  const handleStatusChange = async (id: string, status: IRejectionStatus) => {
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
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace(ROUTES.LOGIN);
        },
      },
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
          numberOfLines={1}
          style={{
            flexShrink: 1,
            fontSize: 22,
            fontFamily: fonts.accent,
            color: colors.primary,
            letterSpacing: 0.5,
            marginRight: 12,
          }}
        >
          Rejection Tracker
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => router.push(ROUTES.SETTINGS)}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? colors.surfaceLight : colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            })}
            testID="account-button"
            accessibilityRole="button"
            accessibilityLabel="Account"
          >
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? colors.surfaceLight : colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            })}
            testID="sign-out-button"
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
          >
            <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {showEmailVerifiedBanner && (
        <Pressable
          onPress={() => setShowEmailVerifiedBanner(false)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginHorizontal: 16,
            marginTop: 16,
            padding: 12,
            backgroundColor: `${colors.success}1A`,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: `${colors.success}40`,
          }}
          testID="email-verified-banner"
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text
            style={{
              flex: 1,
              fontFamily: fonts.bold,
              color: colors.success,
              fontSize: 14,
            }}
          >
            Email verified! You're all set.
          </Text>
        </Pressable>
      )}

      <FlatList
        data={rejections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RejectionCard
            rejection={item}
            onPress={() => router.push(ROUTES.REJECTION(item.id))}
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
          <EmptyStateOnboarding onAddFirst={() => router.push(ROUTES.ADD)} />
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
        onPress={() => router.push(ROUTES.ADD)}
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
