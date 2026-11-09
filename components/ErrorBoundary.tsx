import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ActionButton from "./ui/ActionButton";
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean; attempt: number }
> {
  state = { failed: false, attempt: 0 };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <View style={styles.page}>
          <Text style={styles.title}>Let's try opening the app again 🌈</Text>
          <Text style={styles.message}>
            Something interrupted this screen. Your saved rewards are kept on this device.
          </Text>
          <ActionButton
            variant="primary"
            onPress={() =>
              this.setState((state) => ({ failed: false, attempt: state.attempt + 1 }))
            }
          >
            Try again
          </ActionButton>
        </View>
      );
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF7",
    padding: 24,
  },
  title: { fontSize: 25, fontWeight: "800", color: "#57388E", textAlign: "center" },
  message: { fontSize: 17, color: "#6B647E", textAlign: "center", marginVertical: 20 },
});
