import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, SafeAreaView, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { ProgressProvider } from "./ProgressStore";
import SideMenu, { activities, Screen } from "./SideMenu";
import ErrorBoundary from "./components/ErrorBoundary";
import AppHeader from "./components/ui/AppHeader";
import ActivityRouter from "./navigation/ActivityRouter";
export default function App() {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <LearningApp />
      </ProgressProvider>
    </ErrorBoundary>
  );
}
function LearningApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useCallback((next: Screen) => {
    Speech.stop();
    setMenuOpen(false);
    setScreen(next);
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home") return false;
      navigate("home");
      return true;
    });
    return () => {
      subscription.remove();
      Speech.stop();
    };
  }, [screen, navigate]);
  return (
    <SafeAreaView style={styles.page}>
      <AppHeader
        title={activities.find((activity) => activity.id === screen)?.title ?? "Kids ABC Learning"}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <ActivityRouter screen={screen} onNavigate={navigate} />
      <SideMenu
        visible={menuOpen}
        current={screen}
        onClose={() => setMenuOpen(false)}
        onNavigate={navigate}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFDF7" },
});
