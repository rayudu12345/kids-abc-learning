import { addLearningReward } from "./progressLogic";
import { LearningActivity } from "./data/learningCatalog";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Activity, Progress, addReward, addTracingReward, emptyProgress } from "./progressLogic";

import { createProgressPersistence } from "./progressPersistence";
import ActionButton from "./components/ui/ActionButton";
type Store = {
  progress: Progress;
  saveError: boolean;
  recordAnswer: (letter: string, activity: Activity, completed: boolean) => void;
  recordTracing: (id: string, kind: "letter" | "lowercase" | "animal") => void;
  recordLearning: (activity: LearningActivity, id: string, finished: boolean) => void;
  restoreProgress: (progress: Progress) => Promise<void>;
  restoring: boolean;
  retrySave: () => void;
};
const Context = createContext<Store | null>(null);
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(emptyProgress);
  const current = useRef(progress);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const restoreLock = useRef(false);
  const persistence = useRef(createProgressPersistence(AsyncStorage)).current;
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setReady(false);
    setLoadError(false);
    persistence
      .load()
      .then((restored) => {
        if (live) {
          current.current = restored;
          setProgress(restored);
        }
      })
      .catch(() => {
        if (live) setLoadError(true);
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [loadAttempt, persistence]);
  const save = useCallback(
    (next: Progress) => {
      persistence
        .save(next)
        .then(() => setSaveError(false))
        .catch(() => setSaveError(true));
    },
    [persistence],
  );
  const recordAnswer = useCallback(
    (letter: string, activity: Activity, completed: boolean) => {
      const next = addReward(current.current, letter, activity, completed);
      current.current = next;
      setProgress(next);
      save(next);
    },
    [save],
  );
  const recordTracing = useCallback(
    (id: string, kind: "letter" | "lowercase" | "animal") => {
      const next = addTracingReward(current.current, id, kind);
      current.current = next;
      setProgress(next);
      save(next);
    },
    [save],
  );
  const recordLearning = useCallback(
    (activity: LearningActivity, id: string, finished: boolean) => {
      const next = addLearningReward(current.current, activity, id, finished);
      current.current = next;
      setProgress(next);
      save(next);
    },
    [save],
  );
  const restoreProgress = useCallback(
    async (next: Progress) => {
      if (restoreLock.current) throw new Error("A restore is already in progress.");
      restoreLock.current = true;
      setRestoring(true);
      try {
        await persistence.save(next);
        current.current = next;
        setProgress(next);
        setSaveError(false);
      } finally {
        restoreLock.current = false;
        setRestoring(false);
      }
    },
    [persistence],
  );
  const retrySave = useCallback(() => save(current.current), [save]);
  if (!ready)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFDF7",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22, color: "#59359b" }}>Opening your sticker book… 🐾</Text>
      </View>
    );
  // Do not allow new writes after a read failure: existing rewards may still be on disk.
  if (loadError)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: "#FFFDF7",
        }}
      >
        <Text style={{ fontSize: 22, color: "#59359B", textAlign: "center" }}>
          We couldn't open your saved rewards.
        </Text>
        <Text style={{ marginVertical: 16, textAlign: "center", color: "#6B647E" }}>
          Your saved data has not been changed. Try opening it again.
        </Text>
        <ActionButton onPress={() => setLoadAttempt((attempt) => attempt + 1)}>
          Try opening rewards again
        </ActionButton>
      </View>
    );
  return (
    <Context.Provider
      value={{
        progress,
        saveError,
        recordAnswer,
        recordTracing,
        recordLearning,
        restoreProgress,
        restoring,
        retrySave,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress(): Store {
  const store = useContext(Context);
  if (!store) throw new Error("ProgressProvider is required");
  return store;
}
