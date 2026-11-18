import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { paintPoint } from "../coloringLogic";
import { createStudioPersistence } from "../studioPersistence";
import {
  blankStudio,
  commitStudio,
  fillStudioAt,
  extendStudioMark,
  MAX_STUDIO_MARKS,
  MAX_STUDIO_POINTS,
  redoStudio,
  StudioDocument,
  StudioHistory,
  StudioMark,
  StudioTool,
  studioPointCount,
  undoStudio,
} from "../studioLogic";
// Keep the write queue across navigation so reopening never races an earlier save.
const studioPersistence = createStudioPersistence(AsyncStorage);
export default function usePaintStudio() {
  const [history, setHistory] = useState<StudioHistory>(() => ({
      past: [],
      present: blankStudio(),
      future: [],
    })),
    current = useRef(history);
  const [draft, setDraft] = useState<StudioMark | null>(null),
    stroke = useRef<StudioMark | null>(null);
  const [tool, setTool] = useState<StudioTool>("brush"),
    [color, setColor] = useState("#E45376"),
    [size, setSize] = useState(12),
    [filled, setFilled] = useState(false);
  const [ready, setReady] = useState(false),
    [loadError, setLoadError] = useState(false),
    [saveError, setSaveError] = useState(false),
    [saving, setSaving] = useState(false),
    [loadAttempt, setLoadAttempt] = useState(0);
  const persistence = studioPersistence;
  const live = useRef(true),
    saveGeneration = useRef(0);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setReady(false);
    setLoadError(false);
    void persistence
      .load()
      .then((doc) => {
        if (!active) return;
        const next = { past: [], present: doc, future: [] };
        current.current = next;
        setHistory(next);
        setReady(true);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [persistence, loadAttempt]);
  const save = (doc: StudioDocument) => {
    const generation = ++saveGeneration.current;
    setSaving(true);
    void persistence
      .save(doc)
      .then(
        () => {
          if (live.current && generation === saveGeneration.current) setSaveError(false);
        },
        () => {
          if (live.current && generation === saveGeneration.current) setSaveError(true);
        },
      )
      .finally(() => {
        if (live.current && generation === saveGeneration.current) setSaving(false);
      });
  };
  const update = (next: StudioHistory) => {
    if (!ready || next === current.current) return;
    current.current = next;
    setHistory(next);
    save(next.present);
  };
  const commit = (next: StudioDocument) => update(commitStudio(current.current, next));
  const start = (x: number, y: number) => {
    const point = paintPoint(x, y),
      doc = current.current.present;
    if (!ready || !point) return;
    if (tool === "fill") {
      commit(fillStudioAt(doc, point, color));
      return;
    }
    if (doc.marks.length >= MAX_STUDIO_MARKS || studioPointCount(doc) >= MAX_STUDIO_POINTS - 1)
      return;
    stroke.current = { tool, color, size: tool === "pencil" ? 2 : size, filled, points: [point] };
    setDraft(stroke.current);
  };
  const move = (x: number, y: number) => {
    if (!stroke.current) return;
    const remaining =
      MAX_STUDIO_POINTS - studioPointCount(current.current.present) - stroke.current.points.length;
    stroke.current = extendStudioMark(stroke.current, { x, y }, remaining);
    setDraft(stroke.current);
  };
  const end = () => {
    if (stroke.current)
      commit({
        ...current.current.present,
        marks: [...current.current.present.marks, stroke.current],
      });
    stroke.current = null;
    setDraft(null);
  };
  const pageColor = () => {
    if (current.current.present.background !== color)
      commit({ ...current.current.present, background: color });
  };
  return {
    doc: history.present,
    draft,
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
    filled,
    setFilled,
    ready,
    loadError,
    saveError,
    saving,
    retryLoad: () => setLoadAttempt((value) => value + 1),
    retrySave: () => save(current.current.present),
    start,
    move,
    end,
    pageColor,
    undo: () => update(undoStudio(current.current)),
    redo: () => update(redoStudio(current.current)),
    clear: () => {
      if (current.current.present.marks.length || current.current.present.background !== "#FFFFFF")
        commit(blankStudio());
    },
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    full:
      history.present.marks.length >= MAX_STUDIO_MARKS ||
      studioPointCount(history.present) >= MAX_STUDIO_POINTS - 1,
  };
}
