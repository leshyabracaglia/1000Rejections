import React from "react";
import { View, Text, Pressable, Image, Alert } from "react-native";
import { Rejection, RejectionStatus } from "../types";
import { colors, fonts } from "../constants/theme";

const statusColors: Record<RejectionStatus, string> = {
  pending: colors.warning,
  rejected: colors.primary,
  accepted: colors.success,
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
  const formattedDate = new Date(
    rejection.date + "T00:00:00",
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const status = rejection.status ?? "rejected";
  const borderColor = statusColors[status];

  const handleLongPress = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        backgroundColor: "#0D0D0D",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          backgroundColor: "#242424",
          borderRadius: 12,
          padding: 16,
          opacity: pressed ? 0.7 : 1,
          borderLeftWidth: 3,
          borderLeftColor: borderColor,
          borderTopWidth: 1,
          borderTopColor: "#333333",
          borderBottomWidth: 2,
          borderBottomColor: "#0A0A0A",
        })}
        onPress={onPress}
        onLongPress={handleLongPress}
      >
        {rejection.image_url && (
          <Image
            source={{ uri: rejection.image_url }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              marginRight: 16,
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
                fontSize: 16,
                fontFamily: fonts.bold,
                color: colors.text,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {rejection.title}
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                backgroundColor: `${borderColor}20`,
                marginLeft: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  color: borderColor,
                }}
              >
                {statusLabels[status]}
              </Text>
            </View>
          </View>
          {rejection.description && (
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.regular,
                color: colors.textMuted,
                marginTop: 4,
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
              color: colors.textMuted,
              marginTop: 6,
            }}
          >
            {formattedDate}
          </Text>
          {status === "pending" && onStatusChange && (
            <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
              <Pressable
                style={({ pressed }) => ({
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: pressed
                    ? `${colors.primary}30`
                    : `${colors.primary}15`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}50`,
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
                    color: colors.primary,
                  }}
                >
                  ✗ Rejected
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => ({
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: pressed
                    ? `${colors.success}30`
                    : `${colors.success}15`,
                  borderWidth: 1,
                  borderColor: `${colors.success}50`,
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
                    color: colors.success,
                  }}
                >
                  ✓ Accepted
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
