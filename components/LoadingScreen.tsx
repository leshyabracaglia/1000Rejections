import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { colors, fonts } from "../constants/theme";

const MOTIVATIONAL_LINES = [
  "Every rejection is progress.",
  "Courage is a muscle.",
  "The bold get told no.",
  "Fear less. Ask more.",
  "Rejection is redirection.",
];

export function LoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const line = useRef(
    MOTIVATIONAL_LINES[Math.floor(Math.random() * MOTIVATIONAL_LINES.length)],
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      }}
    >
      <Animated.Text
        style={{ fontSize: 44, opacity: pulseAnim, marginBottom: 16 }}
      >
        🏆
      </Animated.Text>
      <Text
        style={{
          fontSize: 28,
          fontFamily: fonts.accent,
          color: colors.primary,
          letterSpacing: 1.5,
        }}
      >
        Rejection Tracker
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontFamily: fonts.italic,
          color: `${colors.textMuted}99`,
          marginTop: 12,
          textAlign: "center",
          letterSpacing: 0.3,
        }}
      >
        {line}
      </Text>
    </View>
  );
}
