import test from "node:test";
import assert from "node:assert/strict";
import {
  blankStudio,
  commitStudio,
  extendStudioMark,
  fillStudioAt,
  MAX_STUDIO_POINTS,
  readStudio,
  redoStudio,
  STUDIO_HISTORY_LIMIT,
  StudioDocument,
  StudioHistory,
  StudioMark,
  studioBox,
  studioSvg,
  undoStudio,
} from "../../studioLogic";
import { createStudioPersistence } from "../../studioPersistence";
const rectangle = (): StudioMark => ({
  tool: "rectangle",
  color: "#E45376",
  size: 4,
  filled: false,
  points: [
    { x: 40, y: 50 },
    { x: 180, y: 190 },
  ],
});
test("paint documents validate versions, geometry, limits and safe colors", () => {
  assert.deepEqual(readStudio(null), blankStudio());
  const doc = { ...blankStudio(), marks: [rectangle()] };
  assert.deepEqual(readStudio(JSON.stringify(doc)), doc);
  for (const value of [
    null,
    { ...doc, version: 2 },
    { ...doc, background: "<script>" },
    { ...doc, marks: [{ ...rectangle(), tool: "fill" }] },
    { ...doc, marks: [{ ...rectangle(), points: [{ x: -1, y: 0 }] }] },
    { ...doc, marks: [{ ...rectangle(), fillColor: "url(https://example.com)" }] },
    { ...doc, marks: [{ ...rectangle(), size: 1000000 }] },
  ])
    assert.throws(() => readStudio(JSON.stringify(value)));
  assert.throws(() => readStudio(" ".repeat(200001)));
  assert.throws(() =>
    readStudio(
      JSON.stringify({
        ...doc,
        marks: [
          {
            ...rectangle(),
            tool: "brush",
            points: Array.from({ length: MAX_STUDIO_POINTS + 1 }, () => ({ x: 1, y: 1 })),
          },
        ],
      }),
    ),
  );
});
test("paint gestures remain bounded, support lifted strokes and useful tap shapes", () => {
  const mark: StudioMark = { ...rectangle(), tool: "brush", points: [{ x: 0, y: 0 }] };
  const next = extendStudioMark(mark, { x: 900, y: 900 }, 2);
  assert.equal(next.points.length, 3);
  assert.equal(mark.points.length, 1);
  assert.ok(next.points.every((point) => point.x <= 300 && point.y <= 300));
  const shape = extendStudioMark(rectangle(), { x: 250, y: 220 }, 0);
  assert.equal(shape.points.length, 2);
  assert.deepEqual(studioBox([{ x: 100, y: 100 }]), { x: 88, y: 88, width: 24, height: 24 });
  assert.deepEqual(
    studioBox([
      { x: 180, y: 190 },
      { x: 40, y: 50 },
    ]),
    studioBox(rectangle().points),
  );
});
test("fill targets the topmost shape while keeping its outline, or colors the page", () => {
  const top = { ...rectangle(), tool: "oval" as const };
  const doc: StudioDocument = { ...blankStudio(), marks: [rectangle(), top] };
  const filled = fillStudioAt(doc, { x: 100, y: 100 }, "#398FD1");
  assert.equal(filled.marks[0].filled, false);
  assert.equal(filled.marks[1].fillColor, "#398FD1");
  assert.equal(filled.marks[1].color, "#E45376");
  assert.equal(fillStudioAt(filled, { x: 100, y: 100 }, "#398FD1"), filled);
  assert.equal(fillStudioAt(doc, { x: 290, y: 290 }, "#F6C744").background, "#F6C744");
  assert.equal(doc.background, "#FFFFFF");
});
test("undo/redo restore clearing and page colors and truncate redo on a new branch", () => {
  let history: StudioHistory = { past: [], present: blankStudio(), future: [] };
  history = commitStudio(history, { ...history.present, marks: [rectangle()] });
  const drawing = history.present;
  history = commitStudio(history, blankStudio());
  history = undoStudio(history);
  assert.equal(history.present, drawing);
  history = redoStudio(history);
  assert.equal(history.present.marks.length, 0);
  history = undoStudio(history);
  history = commitStudio(history, { ...history.present, background: "#398FD1" });
  assert.equal(history.future.length, 0);
  for (let i = 0; i < 40; i++)
    history = commitStudio(history, { ...history.present, marks: [...history.present.marks] });
  assert.equal(history.past.length, STUDIO_HISTORY_LIMIT);
});
test("SVG export contains editable geometry and erasers follow the current page color", () => {
  const eraser: StudioMark = {
    tool: "eraser",
    color: "#E45376",
    size: 24,
    filled: false,
    points: [
      { x: 10, y: 10 },
      { x: 40, y: 40 },
    ],
  };
  const doc: StudioDocument = {
    version: 1,
    background: "#F6C744",
    marks: [
      rectangle(),
      { ...rectangle(), tool: "oval", filled: true },
      { ...rectangle(), tool: "line" },
      eraser,
    ],
  };
  const svg = studioSvg(doc);
  assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svg.includes("<ellipse") && svg.includes("<polyline"));
  assert.ok(svg.includes('stroke="#F6C744"'));
  assert.ok(!svg.includes("<script") && !svg.includes("href="));
});
test("paint saves serialize writes and a failed save permits retry", async () => {
  let stored: string | null = null,
    fail = true;
  const writes: string[] = [];
  const adapter = createStudioPersistence({
    getItem: async () => stored,
    setItem: async (_key, raw) => {
      if (fail) throw new Error("disk unavailable");
      await new Promise((resolve) => setTimeout(resolve, 2));
      writes.push(raw);
      stored = raw;
    },
  });
  await assert.rejects(adapter.save(blankStudio()));
  fail = false;
  const blue = { ...blankStudio(), background: "#398FD1" };
  await Promise.all([adapter.save(blankStudio()), adapter.save(blue)]);
  assert.equal(writes.length, 2);
  assert.deepEqual(await adapter.load(), blue);
  await assert.rejects(adapter.save({ ...blue, background: "invalid" }));
  assert.deepEqual(await adapter.load(), blue);
});
test("failed or invalid paint reads never overwrite stored artwork", async () => {
  let writes = 0;
  const adapter = createStudioPersistence({
    getItem: async () => '{"version":99}',
    setItem: async () => {
      writes++;
    },
  });
  await assert.rejects(adapter.load());
  assert.equal(writes, 0);
  const error = createStudioPersistence({
    getItem: async () => {
      throw new Error("blocked");
    },
    setItem: async () => {
      writes++;
    },
  });
  await assert.rejects(error.load());
  assert.equal(writes, 0);
});

test("reopening a painting waits for an in-flight save instead of loading older data", async () => {
  let stored = JSON.stringify(blankStudio()),
    release: () => void = () => {};
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const adapter = createStudioPersistence({
    getItem: async () => stored,
    setItem: async (_key, raw) => {
      await barrier;
      stored = raw;
    },
  });
  const blue = { ...blankStudio(), background: "#398FD1" };
  const write = adapter.save(blue);
  let loaded = false;
  const read = adapter.load().then((doc) => {
    loaded = true;
    return doc;
  });
  await new Promise((resolve) => setTimeout(resolve, 2));
  assert.equal(loaded, false);
  release();
  await write;
  assert.deepEqual(await read, blue);
});
