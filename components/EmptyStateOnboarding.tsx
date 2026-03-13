import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  useWindowDimensions,
  ViewToken,
} from "react-native";
import { colors, fonts } from "../constants/theme";

const STEPS = [
  {
    icon: "🎯",
    title: "Ask boldly",
    body: "Request something you want — a raise, a date, a collaboration, a discount. The bolder, the better. Every ask is a win.",
  },
  {
    icon: "📝",
    title: "Log the outcome",
    body: 'Tap the + button to record what you asked for. Mark it pending, then update it when you hear back — "rejected" or "accepted."',
  },
  {
    icon: "📈",
    title: "Watch yourself grow",
    body: "Your counter climbs toward 1,000. Over time you'll see your chart fill up and your fear of rejection fade away.",
  },
];

interface EmptyStateOnboardingProps {
  onAddFirst: () => void;
}

export function EmptyStateOnboarding({
  onAddFirst,
}: EmptyStateOnboardingProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const cardWidth = width - 64;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={{ paddingTop: 16, paddingBottom: 32 }}>
      <Text
        style={{
          fontSize: 22,
          fontFamily: fonts.bold,
          color: colors.text,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Welcome to 1000 Rejections
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontFamily: fonts.regular,
          color: colors.textMuted,
          textAlign: "center",
          marginBottom: 24,
          paddingHorizontal: 32,
          lineHeight: 22,
        }}
      >
        The fastest way to become fearless is to collect rejections on purpose.
      </Text>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 32 }}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: cardWidth,
              marginRight: index < STEPS.length - 1 ? 12 : 0,
              backgroundColor: "#242424",
              borderRadius: 16,
              padding: 28,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#333333",
              borderBottomWidth: 2,
              borderBottomColor: "#0A0A0A",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: `${colors.primary}18`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 30 }}>{item.icon}</Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: fonts.accent,
                color: colors.primary,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Step {index + 1}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: fonts.bold,
                color: colors.text,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.regular,
                color: colors.textMuted,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {item.body}
            </Text>
          </View>
        )}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginTop: 20,
        }}
      >
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIndex ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                i === activeIndex ? colors.primary : `${colors.primary}40`,
            }}
          />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => ({
          marginTop: 28,
          marginHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 14,
          backgroundColor: colors.primary,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        })}
        onPress={onAddFirst}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: fonts.bold,
            color: colors.onPrimary,
          }}
        >
          Log your first ask
        </Text>
      </Pressable>

      <Text
        style={{
          fontSize: 13,
          fontFamily: fonts.regular,
          color: colors.textMuted,
          textAlign: "center",
          marginTop: 12,
          paddingHorizontal: 48,
          lineHeight: 20,
        }}
      >
        You're 1 rejection closer to 1,000. Let's go!
      </Text>
    </View>
  );
}
