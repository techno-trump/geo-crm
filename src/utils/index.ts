export function isNotEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export const toFixed = (value: string | number, number: number = 0) => {
  return Number(value).toFixed(number);
};

export const MARKER_SPRITE =
  "/images/svg/pin.svg";

export function drawMarker(
  ctx: CanvasRenderingContext2D,
  markerCoord: { x: number; y: number; value: string }
) {
  const markerImg = new Image();
  markerImg.src = MARKER_SPRITE;
  markerImg.width = 57;
  markerImg.height = 30;
  markerImg.onload = () => {
    ctx.drawImage(
      markerImg,
      markerCoord.x,
      markerCoord.y - markerImg.height,
      markerImg.width,
      markerImg.height
    );
    const markerText = `${markerCoord.value}`;
    const textMetrics = ctx.measureText(markerText);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#176B3E";
    ctx.fillText(markerText, markerCoord.x + 2 + (markerImg.width - textMetrics.width)/2, markerCoord.y - 16);
  };
}

export function drawImage(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  ctx: CanvasRenderingContext2D
) {
  const aspectRatio = img.width / img.height;

  // Определяем новые размеры изображения так, чтобы оно вписывалось в канвас
  let newWidth = canvas.width;
  let newHeight = canvas.width / aspectRatio;

  // Если новая высота больше высоты канваса, уменьшаем ширину вместо высоты
  if (newHeight > canvas.height) {
    newWidth = canvas.height * aspectRatio;
    newHeight = canvas.height;
  }

  // Рисуем изображение на канвасе с новыми размерами
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
}
