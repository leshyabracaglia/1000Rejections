import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

const t = { bg: '#121212', primary: '#BB86FC', text: '#FFFFFF', textMuted: '#B3B3B3' };

const MOTIVATIONAL_LINES = [
  'Every rejection is progress.',
  'Courage is a muscle.',
  'The bold get told no.',
  'Fear less. Ask more.',
  'Rejection is redirection.',
];

export function LoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const line = useRef(MOTIVATIONAL_LINES[Math.floor(Math.random() * MOTIVATIONAL_LINES.length)]).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      <Animated.Text style={{ fontSize: 52, opacity: pulseAnim, marginBottom: 12 }}>
        🏆
      </Animated.Text>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: t.primary, letterSpacing: 0.5 }}>
        1000 Rejections
      </Text>
      <Text style={{ fontSize: 15, color: t.textMuted, marginTop: 12, fontStyle: 'italic', textAlign: 'center' }}>
        {line}
      </Text>
    </View>
  );
}
