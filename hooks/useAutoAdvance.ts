import { useEffect, useRef } from "react";
/** Run the latest callback once after a celebration; cancel when disabled or unmounted. */
export default function useAutoAdvance(enabled: boolean, onAdvance: () => void, delay: number) {
  const callback = useRef(onAdvance);
  callback.current = onAdvance;
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => callback.current(), delay);
    return () => clearTimeout(timer);
  }, [enabled, delay]);
}
