import { MarkerValue } from "./BoxDeepnesMarkup.tsx";
import { useEffect, useState } from "react";
import { api } from "../config";
import { drawImage, drawMarker } from "../utils";
import { deepnessMarkupApi } from "../services/deepnesMarkup.ts";
import { useAppDispatch, useAppSelector } from "../stores/hooks.ts";
import {
  setImgParam,
  setMarkers,
  syncMarkers,
} from "../stores/deepnesSlice.ts";

type CanvasImageProps = {
  image: number;
  markers: MarkerValue[];
};

export type MarkerCoords = {
  id: number;
  x: number;
  y: number;
  value: string;
};

export const CanvasImage = ({ image, markers }: CanvasImageProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [background, setBackground] = useState<HTMLImageElement | null>(null);
  const { data: dotsData } = deepnessMarkupApi.useGetDotsQuery(Number(image));
  const dispatch = useAppDispatch();
  const markerCoords = useAppSelector((state) => state.deepness.markers);
  const imgParam = useAppSelector((state) => state.deepness.imgParam);

  useEffect(() => {
    if (dotsData) {
      dispatch(
        setMarkers(
          dotsData.map((dot) => ({
            id: dot.id,
            x: (dot.x_px / imgParam.x) * 1000,
            y: (dot.y_px * 1000) / imgParam.x,
            value: String(dot.depth_m),
          }))
        )
      );
    }
  }, [dotsData]);

  useEffect(() => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        setCtx(ctx);
      }
    }
  }, [canvas]);

  useEffect(() => {
    dispatch(syncMarkers(markers));
  }, [markers]);

  useEffect(() => {
    if (ctx && image) {
      console.log("image change");
      const img = new Image();
      img.src = `${api.url}images/${image}`;
      img.onload = () => {
        dispatch(setImgParam({ x: img.width, y: img.height }));
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        setBackground(img);
        drawImage(canvas!, img, ctx);
        ctx.font = "14px Arial";
        ctx.fillStyle = "white";
      };
    }
  }, [ctx, image]);

  useEffect(() => {
    if (ctx && image) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      if (background) {
        drawImage(canvas!, background, ctx);
        markerCoords.forEach((markerCoord) => {
          drawMarker(ctx, markerCoord);
        });
      } else {
        const img = new Image();
        img.src = `${api.url}images/${image}`;
        img.onload = () => {
          drawImage(canvas!, img, ctx);
          markerCoords.forEach((markerCoord) => {
            drawMarker(ctx, markerCoord);
          });
        };
      }
    }
  }, [markerCoords]);

  return (
    <canvas
      width={1000}
      height={414}
      ref={(ref) => {
        if (ref) {
          setCanvas(ref);
        }
      }}
      onClick={(e) => {
        const rect = canvas?.getBoundingClientRect();
        const x = e.clientX - rect!.left;
        const y = e.clientY - rect!.top;
        if (markerCoords.length === markers.length) return;
        const marker = markers[markerCoords.length];
        dispatch(
          setMarkers([
            ...markerCoords,
            { id: marker.id, x, y, value: marker.value },
          ])
        );
      }}
    />
  );
};
