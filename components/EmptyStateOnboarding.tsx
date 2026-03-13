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

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <View style={{ paddingTop: 20, paddingBottom: 32 }}>
      <Text
        style={{
          fontSize: 22,
          fontFamily: fonts.bold,
          color: colors.text,
          textAlign: "center",
          marginBottom: 6,
          letterSpacing: -0.3,
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
          marginBottom: 28,
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
              backgroundColor: colors.surfaceElevated,
              borderRadius: 16,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: `${colors.primary}12`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 26 }}>{item.icon}</Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: fonts.accent,
                color: colors.primary,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
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
                letterSpacing: -0.2,
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
          gap: 6,
          marginTop: 20,
        }}
      >
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor:
                i === activeIndex ? colors.primary : `${colors.primary}30`,
            }}
          />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => ({
          marginTop: 32,
          marginHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 14,
          backgroundColor: colors.primary,
          alignItems: "center",
          opacity: pressed ? 0.9 : 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        })}
        onPress={onAddFirst}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: fonts.bold,
            color: colors.onPrimary,
            letterSpacing: 0.3,
          }}
        >
          Log your first ask
        </Text>
      </Pressable>

      <Text
        style={{
          fontSize: 13,
          fontFamily: fonts.regular,
          color: `${colors.textMuted}88`,
          textAlign: "center",
          marginTop: 14,
          paddingHorizontal: 48,
          lineHeight: 20,
        }}
      >
        You're 1 rejection closer to 1,000. Let's go!
      </Text>
    </View>
  );
}
