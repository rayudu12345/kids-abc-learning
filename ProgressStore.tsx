import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Activity,
  Progress,
  addReward,
  addTracingReward,
  emptyProgress,
  readProgress,
} from "./progressLogic";

const KEY = "@kids-abc/progress/v1";
type Store = {
  progress: Progress;
  saveError: boolean;
  recordAnswer: (letter: string, activity: Activity, completed: boolean) => void;
  recordTracing: (id: string, kind: "letter" | "animal") => void;
  retrySave: () => void;
};
const Context = createContext<Store | null>(null);
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(emptyProgress);
  const current = useRef(progress);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const restored = readProgress(raw);
        if (live) {
          current.current = restored;
          setProgress(restored);
        }
      })
      .catch(() => {
        if (live) setSaveError(true);
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);
  const save = useCallback((next: Progress) => {
    // Serialize writes so an earlier reward cannot overwrite a newer one.
    queue.current = queue.current.then(async () => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(next));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    });
  }, []);
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
    (id: string, kind: "letter" | "animal") => {
      const next = addTracingReward(current.current, id, kind);
      current.current = next;
      setProgress(next);
      save(next);
    },
    [save],
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
  return (
    <Context.Provider value={{ progress, saveError, recordAnswer, recordTracing, retrySave }}>
      {children}
    </Context.Provider>
  );
}
export function useProgress(): Store {
  const store = useContext(Context);
  if (!store) throw new Error("ProgressProvider is required");
  return store;
}
