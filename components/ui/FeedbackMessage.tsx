import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
export default function FeedbackMessage({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text accessibilityLiveRegion="polite" style={[styles.message, style]}>
      {children}
    </Text>
  );
}
const styles = StyleSheet.create({
  message: {
    fontSize: 19,
    color: "#5E4980",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 16,
  },
});
