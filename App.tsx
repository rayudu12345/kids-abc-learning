import React, { useCallback, useEffect, useState } from "react";
import { AppState, BackHandler, SafeAreaView, StyleSheet } from "react-native";
import * as Speech from "./audio/speech";
import { ProgressProvider, useProgress } from "./ProgressStore";
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
  const { restoring } = useProgress();
  const [screen, setScreen] = useState<Screen>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") void Speech.stop();
    });
    return () => subscription.remove();
  }, []);
  const navigate = useCallback(
    (next: Screen) => {
      if (restoring) return;
      Speech.stop();
      setMenuOpen(false);
      setScreen(next);
    },
    [restoring],
  );
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
        onOpenMenu={() => {
          if (!restoring) setMenuOpen(true);
        }}
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
