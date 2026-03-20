import React, { Component, ErrorInfo } from "react";
import { View, Text, Pressable } from "react-native";
import { colors, fonts } from "../constants/theme";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
        <Text style={{ fontSize: 44, marginBottom: 16 }}>:(</Text>
        <Text
          style={{
            fontSize: 22,
            fontFamily: fonts.accent,
            color: colors.primary,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontFamily: fonts.regular,
            color: colors.textMuted,
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 22,
          }}
        >
          An unexpected error occurred. Tap below to try again.
        </Text>
        <Pressable
          onPress={this.handleRetry}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: fonts.bold,
              color: colors.onPrimary,
              letterSpacing: 0.3,
            }}
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }
}
