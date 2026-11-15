import { useEffect, useState } from "react";
import { AppState } from "react-native";
import useReducedMotion from "./useReducedMotion";
/** Respect both the device's motion preference and application visibility. */
export default function useAnimationEnabled(requested = true) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  return requested && active && !reduced;
}
