import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Rejection, RejectionStatus, normalizeRejection } from "../../types";
import { Counter } from "../../components/Counter";
import { RejectionCard } from "../../components/RejectionCard";
import { LoadingScreen } from "../../components/LoadingScreen";
import { RejectionChart } from "../../components/RejectionChart";
import { EmptyStateOnboarding } from "../../components/EmptyStateOnboarding";
import { aggregateByMonthMulti } from "../../lib/chartUtils";
import { colors, fonts } from "../../constants/theme";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [loading, setLoading] = useState(true);

  const [percentile, setPercentile] = useState<number | null>(null);

  const chartData = useMemo(
    () => aggregateByMonthMulti(rejections, 6),
    [rejections],
  );

  const pendingCount = useMemo(
    () => rejections.filter((r) => r.status === "pending").length,
    [rejections],
  );
  const rejectedCount = useMemo(
    () => rejections.filter((r) => r.status === "rejected").length,
    [rejections],
  );
  const acceptedCount = useMemo(
    () => rejections.filter((r) => r.status === "accepted").length,
    [rejections],
  );

  const fetchRejections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("rejections")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching rejections:", error);
    } else {
      setRejections((data || []).map(normalizeRejection));
      fetchPercentile(data?.length || 0);
    }
    setLoading(false);
  };

  const fetchPercentile = async (myCount: number) => {
    if (myCount === 0) {
      setPercentile(null);
      return;
    }

    const { data, error } = await supabase.from("rejections").select("user_id");

    if (error || !data) {
      setPercentile(null);
      return;
    }

    const userCounts: Record<string, number> = {};
    data.forEach((r) => {
      userCounts[r.user_id] = (userCounts[r.user_id] || 0) + 1;
    });

    const counts = Object.values(userCounts);
    const totalUsers = counts.length;
    const usersWithFewer = counts.filter((c) => c < myCount).length;

    const pct = Math.round((usersWithFewer / totalUsers) * 100);
    setPercentile(pct);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRejections();
    }, [user]),
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rejections").delete().eq("id", id);

    if (error) {
      Alert.alert("Error", "Failed to delete event");
    } else {
      setRejections((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleStatusChange = async (id: string, status: RejectionStatus) => {
    const { error } = await supabase
      .from("rejections")
      .update({ status })
      .eq("id", id);

    if (error) {
      Alert.alert("Error", "Failed to update status");
    } else {
      setRejections((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
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
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => ({
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 8,
            backgroundColor: pressed
              ? colors.surfaceLight
              : colors.surfaceElevated,
            borderWidth: 1,
            borderColor: pressed ? colors.border : colors.borderSubtle,
          })}
        >
          <Text
            style={{
              fontFamily: fonts.regular,
              color: colors.textMuted,
              fontSize: 13,
              letterSpacing: 0.2,
            }}
          >
            Sign Out
          </Text>
        </Pressable>
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
                    borderColor: `${colors.primary}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: fonts.bold,
                      color: colors.primary,
                      textAlign: "center",
                      letterSpacing: -0.2,
                    }}
                  >
                    You're in the top {100 - percentile}% of rejection loggers!
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
                    You are fearless!
                  </Text>
                </View>
              )}
            </>
          ) : null
        }
        ListEmptyComponent={
          <EmptyStateOnboarding
            onAddFirst={() => router.push("/(main)/add")}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Pressable
        style={({ pressed }) => ({
          position: "absolute",
          right: 24,
          bottom: 36,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 10,
          transform: [{ scale: pressed ? 0.93 : 1 }],
        })}
        onPress={() => router.push("/(main)/add")}
      >
        <Text
          style={{
            fontSize: 28,
            color: colors.onPrimary,
            fontWeight: "300",
            marginTop: -1,
          }}
        >
          +
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
