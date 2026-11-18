import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
async function sharePicture(contents: string, type: "svg" | "png") {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Picture sharing is unavailable on this device.");
  const file = new File(Paths.cache, `kids-abc-paint-${Date.now()}.${type}`);
  file.create({ overwrite: true });
  await file.write(contents, { encoding: type === "png" ? "base64" : "utf8" });
  await Sharing.shareAsync(file.uri, {
    mimeType: type === "png" ? "image/png" : "image/svg+xml",
    UTI: type === "png" ? "public.png" : "public.svg-image",
    dialogTitle: "Save your Paint Studio picture",
  });
}
export const exportStudioPicture = (svg: string) => sharePicture(svg, "svg");
export async function exportStudioPng(_svg: string, capture: () => Promise<string>): Promise<void> {
  const base64 = (await capture()).replace(/^data:image\/png;base64,/, "");
  if (!base64) throw new Error("Could not create the picture. Please try again.");
  await sharePicture(base64, "png");
}
