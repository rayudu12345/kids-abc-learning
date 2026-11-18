function download(blob: Blob, extension: string) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = `kids-abc-paint-${Date.now()}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportStudioPicture(svg: string): Promise<void> {
  download(new Blob([svg], { type: "image/svg+xml" }), "svg");
}
export async function exportStudioPng(svg: string, _capture: () => Promise<string>): Promise<void> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(
        () => reject(new Error("Picture creation timed out. Please try again.")),
        10000,
      );
      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Could not create the picture."));
      };
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("PNG export is unavailable in this browser.");
    context.drawImage(image, 0, 0, 1200, 1200);
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not create PNG picture."))),
        "image/png",
      ),
    );
    download(png, "png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
