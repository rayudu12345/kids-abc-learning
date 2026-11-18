import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg from "react-native-svg";
import usePaintStudio from "../hooks/usePaintStudio";
import { studioSvg } from "../studioLogic";
import { exportStudioPicture, exportStudioPng } from "../studioFiles";
import StudioCanvas from "../components/paint/StudioCanvas";
import StudioTools from "../components/paint/StudioTools";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
const hints = {
  brush: "Paint with your finger, or tap to make dots.",
  pencil: "Draw fine lines with your finger.",
  eraser: "Rub over marks to erase them.",
  line: "Drag from one end of your line to the other.",
  rectangle: "Tap for a square, or drag to draw a rectangle.",
  oval: "Tap for a circle, or drag to draw an oval.",
  fill: "Tap inside a shape to fill it. Tap outside shapes to color the page.",
};
export default function PaintStudio({ onExit }: { onExit: () => void }) {
  const paint = usePaintStudio(),
    { width, height } = useWindowDimensions();
  const canvas = useRef<Svg | null>(null),
    exportLock = useRef(false);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const size = Math.max(200, Math.min(width - 32, height * 0.43, 650));
  const capture = () =>
    new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Picture creation timed out. Please try again.")),
        10000,
      );
      try {
        if (!canvas.current) throw new Error("The painting is not ready yet.");
        canvas.current.toDataURL(
          (base64) => {
            clearTimeout(timer);
            resolve(base64);
          },
          { width: 1200, height: 1200 },
        );
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  const savePicture = async (png: boolean) => {
    if (exportLock.current || !paint.ready) return;
    exportLock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const svg = studioSvg(paint.doc);
      if (png) await exportStudioPng(svg, capture);
      else await exportStudioPicture(svg);
      setMessage("Picture export opened. Save your copy in Files or a photo app.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not export the picture. Try again.",
      );
    } finally {
      exportLock.current = false;
      setBusy(false);
    }
  };
  return (
    <ScrollView
      style={styles.page}
      scrollEnabled={!paint.draft}
      contentContainerStyle={styles.content}
    >
      <ActionButton onPress={onExit} disabled={busy}>
        ‹ Alphabet
      </ActionButton>
      <Text style={styles.title}>🖌 Paint Studio</Text>
      {!paint.ready ? (
        <>
          <FeedbackMessage>
            {paint.loadError
              ? "We could not open your saved picture. It has been kept unchanged."
              : "Opening your picture…"}
          </FeedbackMessage>
          {paint.loadError && (
            <ActionButton onPress={paint.retryLoad}>Retry opening picture</ActionButton>
          )}
        </>
      ) : (
        <>
          <StudioTools
            tool={paint.tool}
            onTool={paint.setTool}
            color={paint.color}
            onColor={paint.setColor}
            size={paint.size}
            onSize={paint.setSize}
            filled={paint.filled}
            onFilled={() => paint.setFilled((value) => !value)}
            disabled={busy || Boolean(paint.draft)}
          />
          <Text style={styles.hint}>{hints[paint.tool]}</Text>
          <StudioCanvas
            ref={canvas}
            doc={paint.doc}
            draft={paint.draft}
            size={size}
            enabled={!busy}
            onStart={paint.start}
            onMove={paint.move}
            onEnd={paint.end}
          />
          <View style={styles.row}>
            <ActionButton
              disabled={!paint.canUndo || busy || Boolean(paint.draft)}
              onPress={paint.undo}
            >
              ↶ Undo
            </ActionButton>
            <ActionButton
              disabled={!paint.canRedo || busy || Boolean(paint.draft)}
              onPress={paint.redo}
            >
              ↷ Redo
            </ActionButton>
            <ActionButton disabled={busy || Boolean(paint.draft)} onPress={paint.clear}>
              Clear page
            </ActionButton>
            <ActionButton disabled={busy || Boolean(paint.draft)} onPress={paint.pageColor}>
              Paint page color
            </ActionButton>
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.status}>
            {paint.saveError
              ? "Picture could not save. Keep this page open and retry."
              : paint.saving
                ? "Saving your picture…"
                : "Changes save automatically on this device."}
          </Text>
          {paint.saveError && (
            <ActionButton onPress={paint.retrySave} disabled={paint.saving}>
              Retry saving picture
            </ActionButton>
          )}
          <View style={styles.row}>
            <ActionButton
              variant="primary"
              disabled={busy || Boolean(paint.draft)}
              onPress={() => void savePicture(true)}
            >
              💾 Save PNG picture
            </ActionButton>
            <ActionButton
              disabled={busy || Boolean(paint.draft)}
              onPress={() => void savePicture(false)}
            >
              Save SVG picture
            </ActionButton>
          </View>
          {paint.full && (
            <FeedbackMessage>A page full of art! Undo or clear to make more room.</FeedbackMessage>
          )}
          {message && <FeedbackMessage>{message}</FeedbackMessage>}
          <Text style={styles.note}>
            Your latest picture stays here when you return. Save a PNG copy outside the app to keep
            it after uninstalling. Undo and redo work while this activity is open.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFF4F8" },
  content: { padding: 16, alignItems: "center", paddingBottom: 35 },
  title: { fontSize: 30, color: "#57388E", fontWeight: "900", marginVertical: 15 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginVertical: 10,
  },
  hint: {
    fontSize: 18,
    color: "#267866",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },
  status: { fontSize: 17, color: "#615574", textAlign: "center", marginVertical: 10 },
  note: { fontSize: 16, lineHeight: 24, color: "#615574", textAlign: "center", maxWidth: 700 },
});
