/**
 * Crops a photo to the centre at the given aspect ratio and shrinks it to
 * width × height, encoded as WebP — or JPEG where the browser can't encode
 * WebP (Safari before 17), since every bucket accepts one of the two.
 */
export async function resizeImage(file: File, width: number, height: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(bitmap.width / width, bitmap.height / height);
  const sourceWidth = width * scale;
  const sourceHeight = height * scale;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");
  context.drawImage(
    bitmap,
    (bitmap.width - sourceWidth) / 2,
    (bitmap.height - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  );
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Could not encode image"))),
        type,
        0.85
      )
    );
  const webp = await encode("image/webp");
  // Browsers that can't encode WebP silently return PNG instead.
  return webp.type === "image/webp" ? webp : encode("image/jpeg");
}

export function imageExtension(blob: Blob): string {
  return blob.type === "image/webp" ? "webp" : "jpg";
}
