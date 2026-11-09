import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

type Props = Omit<PressableProps, "children" | "style"> & {
  children: string;
  variant?: "soft" | "primary";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};
export default function ActionButton({
  children,
  variant = "soft",
  style,
  textStyle,
  disabled,
  ...props
}: Props) {
  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityState={{ ...props.accessibilityState, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.primary,
        style,
        (disabled || pressed) && styles.dim,
      ]}
    >
      <Text style={[styles.text, variant === "primary" && styles.primaryText, textStyle]}>
        {children}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#EEE8FF",
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#6946BC", paddingHorizontal: 20 },
  text: { color: "#58369E", fontSize: 16, fontWeight: "800", textAlign: "center" },
  primaryText: { color: "#FFFFFF" },
  dim: { opacity: 0.65 },
});
