import { Point } from "./traceCatalog";
import { extendPaint, paintPoint } from "./coloringLogic";
export const STUDIO_KEY = "kids-abc-paint-studio-v1";
export const MAX_STUDIO_POINTS = 1800;
export const MAX_STUDIO_MARKS = 200;
export const STUDIO_HISTORY_LIMIT = 30;
export type StudioTool = "brush" | "pencil" | "eraser" | "line" | "rectangle" | "oval" | "fill";
export const studioTools: { id: StudioTool; label: string }[] = [
  { id: "fill", label: "🪣 Fill" },
  { id: "brush", label: "🖌 Brush" },
  { id: "pencil", label: "✏️ Pencil" },
  { id: "eraser", label: "🧽 Eraser" },
  { id: "line", label: "╱ Line" },
  { id: "rectangle", label: "▭ Rectangle" },
  { id: "oval", label: "◯ Oval" },
];
export const studioColors = [
  { name: "Red", value: "#E45376" },
  { name: "Orange", value: "#E98B31" },
  { name: "Yellow", value: "#F6C744" },
  { name: "Green", value: "#299D7C" },
  { name: "Blue", value: "#398FD1" },
  { name: "Purple", value: "#9366CA" },
  { name: "Pink", value: "#F3A8D0" },
  { name: "Brown", value: "#98623E" },
  { name: "Black", value: "#302A3C" },
  { name: "White", value: "#FFFFFF" },
];
export type StudioMark = {
  tool: Exclude<StudioTool, "fill">;
  color: string;
  size: number;
  filled: boolean;
  fillColor?: string;
  points: Point[];
};
export type StudioDocument = { version: 1; background: string; marks: StudioMark[] };
export type StudioHistory = {
  past: StudioDocument[];
  present: StudioDocument;
  future: StudioDocument[];
};
export const blankStudio = (): StudioDocument => ({ version: 1, background: "#FFFFFF", marks: [] });
export const studioPointCount = (doc: StudioDocument) =>
  doc.marks.reduce((sum, mark) => sum + mark.points.length, 0);
export const isFreehand = (tool: StudioTool) => ["brush", "pencil", "eraser"].includes(tool);
export function extendStudioMark(mark: StudioMark, next: Point, budget: number): StudioMark {
  const point = paintPoint(next.x, next.y);
  if (!point) return mark;
  return {
    ...mark,
    points: isFreehand(mark.tool)
      ? extendPaint(mark.points, point, mark.size, budget)
      : [mark.points[0], point],
  };
}
export function studioBox(points: Point[]) {
  const a = points[0],
    b = points.at(-1)!;
  const tap = Math.hypot(b.x - a.x, b.y - a.y) < 2;
  const width = tap ? 24 : Math.max(2, Math.abs(b.x - a.x));
  const height = tap ? 24 : Math.max(2, Math.abs(b.y - a.y));
  return {
    x: Math.max(0, Math.min(300 - width, tap ? a.x - 12 : Math.min(a.x, b.x))),
    y: Math.max(0, Math.min(300 - height, tap ? a.y - 12 : Math.min(a.y, b.y))),
    width,
    height,
  };
}
export function commitStudio(history: StudioHistory, next: StudioDocument): StudioHistory {
  if (next === history.present) return history;
  return {
    past: [...history.past, history.present].slice(-STUDIO_HISTORY_LIMIT),
    present: next,
    future: [],
  };
}
export function undoStudio(history: StudioHistory): StudioHistory {
  if (!history.past.length) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past.at(-1)!,
    future: [history.present, ...history.future].slice(0, STUDIO_HISTORY_LIMIT),
  };
}
export function redoStudio(history: StudioHistory): StudioHistory {
  if (!history.future.length) return history;
  return {
    past: [...history.past, history.present].slice(-STUDIO_HISTORY_LIMIT),
    present: history.future[0],
    future: history.future.slice(1),
  };
}
const validColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
export function readStudio(raw: string | null): StudioDocument {
  if (raw === null) return blankStudio();
  if (raw.length > 200000) throw new Error("Painting file is too large.");
  const value = JSON.parse(raw) as Partial<StudioDocument> | null;
  if (
    !value ||
    value.version !== 1 ||
    !validColor(value.background) ||
    !Array.isArray(value.marks) ||
    value.marks.length > MAX_STUDIO_MARKS
  )
    throw new Error("Unsupported painting format.");
  let count = 0;
  for (const mark of value.marks) {
    if (
      !mark ||
      !studioTools.filter((tool) => tool.id !== "fill").some((tool) => tool.id === mark.tool) ||
      !validColor(mark.color) ||
      ![2, 4, 12, 24].includes(mark.size) ||
      (mark.fillColor !== undefined && !validColor(mark.fillColor)) ||
      typeof mark.filled !== "boolean" ||
      !Array.isArray(mark.points) ||
      !mark.points.length ||
      (!isFreehand(mark.tool) && mark.points.length > 2)
    )
      throw new Error("Invalid painting tool or stroke.");
    count += mark.points.length;
    if (
      count > MAX_STUDIO_POINTS ||
      mark.points.some(
        (point) =>
          !point ||
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) ||
          point.x < 0 ||
          point.y < 0 ||
          point.x > 300 ||
          point.y > 300,
      )
    )
      throw new Error("Invalid painting coordinates.");
  }
  return { version: 1, background: value.background, marks: value.marks };
}
/** Export validated geometry only; no external images, scripts, or user-supplied XML. */
export function studioSvg(doc: StudioDocument): string {
  const safe = readStudio(JSON.stringify(doc));
  const n = (value: number) => Number(value.toFixed(2));
  const elements = safe.marks.map((mark) => {
    const color = mark.tool === "eraser" ? safe.background : mark.color;
    const a = mark.points[0],
      b = mark.points.at(-1)!;
    if (mark.tool === "rectangle" || mark.tool === "oval") {
      const box = studioBox(mark.points),
        fill = mark.filled ? (mark.fillColor ?? color) : "none";
      return mark.tool === "rectangle"
        ? `<rect x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}" fill="${fill}" stroke="${color}" stroke-width="${mark.size}"/>`
        : `<ellipse cx="${n(box.x + box.width / 2)}" cy="${n(box.y + box.height / 2)}" rx="${n(box.width / 2)}" ry="${n(box.height / 2)}" fill="${fill}" stroke="${color}" stroke-width="${mark.size}"/>`;
    }
    if (mark.points.length === 1 || (mark.tool === "line" && a.x === b.x && a.y === b.y))
      return `<circle cx="${n(a.x)}" cy="${n(a.y)}" r="${mark.size / 2}" fill="${color}"/>`;
    return `<polyline points="${mark.points.map((point) => `${n(point.x)},${n(point.y)}`).join(" ")}" fill="none" stroke="${color}" stroke-width="${mark.size}" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 300 300"><title>My Paint Studio picture</title><rect width="300" height="300" fill="${safe.background}"/>${elements.join("")}</svg>`;
}

/** Bucket fill applies to the topmost geometric shape, otherwise to the page. */
export function fillStudioAt(doc: StudioDocument, point: Point, color: string): StudioDocument {
  if (!validColor(color) || !paintPoint(point.x, point.y)) return doc;
  for (let index = doc.marks.length - 1; index >= 0; index--) {
    const mark = doc.marks[index];
    if (mark.tool !== "rectangle" && mark.tool !== "oval") continue;
    const box = studioBox(mark.points);
    const inside =
      mark.tool === "rectangle"
        ? point.x >= box.x &&
          point.x <= box.x + box.width &&
          point.y >= box.y &&
          point.y <= box.y + box.height
        : ((point.x - box.x - box.width / 2) / (box.width / 2)) ** 2 +
            ((point.y - box.y - box.height / 2) / (box.height / 2)) ** 2 <=
          1;
    if (inside) {
      if (mark.filled && (mark.fillColor ?? mark.color) === color) return doc;
      return {
        ...doc,
        marks: doc.marks.map((item, i) =>
          i === index ? { ...item, filled: true, fillColor: color } : item,
        ),
      };
    }
  }
  return doc.background === color ? doc : { ...doc, background: color };
}
