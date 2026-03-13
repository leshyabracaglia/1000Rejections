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
    <Pressable
      style={({ pressed }) => ({
        marginHorizontal: 16,
        marginVertical: 5,
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
      onLongPress={handleLongPress}
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
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: `${borderColor}15`,
                borderWidth: 1,
                borderColor: `${borderColor}25`,
                marginLeft: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  color: borderColor,
                  letterSpacing: 0.3,
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
                    ? `${colors.primary}25`
                    : `${colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}30`,
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
                    ? `${colors.success}25`
                    : `${colors.success}10`,
                  borderWidth: 1,
                  borderColor: `${colors.success}30`,
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
  );
}
