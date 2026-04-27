import React, { useRef } from "react";
import { View, Text, Pressable, Image, Alert, Animated } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Rejection, RejectionStatus } from "../types";
import { colors, fonts } from "../constants/theme";
import { Badge } from "./ui";

const statusColors: Record<RejectionStatus, string> = {
  pending: colors.warning,
  rejected: colors.rejection,
  accepted: colors.acceptance,
};

const statusLabels: Record<RejectionStatus, string> = {
  pending: "Pending",
  rejected: "Rejected",
  accepted: "Accepted",
};

interface RejectionCardProps {
  rejection: Rejection;
  onPress: () => void;
  onDelete: () => void;
  onStatusChange?: (status: RejectionStatus) => void;
}

export function RejectionCard({
  rejection,
  onPress,
  onDelete,
  onStatusChange,
}: RejectionCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const formattedDate = new Date(
    rejection.date + "T00:00:00",
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const status = rejection.status ?? "rejected";
  const borderColor = statusColors[status];

  const confirmDelete = () => {
    Alert.alert("Delete Rejection", "Are you sure you want to delete this rejection?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => swipeableRef.current?.close(),
      },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={confirmDelete}
        style={({ pressed }) => ({
          width: 80,
          backgroundColor: pressed ? colors.error : `${colors.error}DD`,
          justifyContent: "center",
          alignItems: "center",
          borderTopRightRadius: 14,
          borderBottomRightRadius: 14,
        })}
      >
        <Animated.Text
          style={{
            color: "#fff",
            fontFamily: fonts.bold,
            fontSize: 13,
            letterSpacing: 0.3,
            transform: [{ scale }],
            opacity,
          }}
        >
          Delete
        </Animated.Text>
      </Pressable>
    );
  };

  return (
    <View style={{ marginHorizontal: 16, marginVertical: 5 }}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rejection.title}
          style={({ pressed }) => ({
            borderRadius: 14,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: pressed ? colors.border : colors.borderSubtle,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
            opacity: pressed ? 0.92 : 1,
          })}
          onPress={onPress}
          onLongPress={confirmDelete}
        >
          <View
            style={{
              flexDirection: "row",
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: borderColor,
              borderRadius: 14,
            }}
          >
            {rejection.image_url && (
              <Image
                source={{ uri: rejection.image_url }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  marginRight: 14,
                }}
              />
            )}
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: fonts.bold,
                    color: colors.text,
                    flex: 1,
                    letterSpacing: 0.1,
                  }}
                  numberOfLines={1}
                >
                  {rejection.title}
                </Text>
                <Badge
                  label={statusLabels[status]}
                  color={borderColor}
                  style={{ marginLeft: 10 }}
                />
              </View>
              {rejection.description && (
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: fonts.regular,
                    color: colors.textMuted,
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                  numberOfLines={2}
                >
                  {rejection.description}
                </Text>
              )}
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: fonts.accentRegular,
                  color: `${colors.textMuted}99`,
                  marginTop: 6,
                  letterSpacing: 0.5,
                }}
              >
                {formattedDate}
              </Text>
              {status === "pending" && onStatusChange && (
                <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
                  <Pressable
                    style={({ pressed }) => ({
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? `${colors.rejection}25`
                        : `${colors.rejection}10`,
                      borderWidth: 1,
                      borderColor: `${colors.rejection}30`,
                    })}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onStatusChange("rejected");
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.bold,
                        color: colors.rejection,
                        letterSpacing: 0.2,
                      }}
                    >
                      Rejected
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => ({
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? `${colors.acceptance}25`
                        : `${colors.acceptance}10`,
                      borderWidth: 1,
                      borderColor: `${colors.acceptance}30`,
                    })}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onStatusChange("accepted");
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.bold,
                        color: colors.acceptance,
                        letterSpacing: 0.2,
                      }}
                    >
                      Accepted
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}
