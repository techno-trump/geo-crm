import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarkerCoords } from "../components/CanvasImage.tsx";
import { MarkerValue } from "../components/BoxDeepnesMarkup.tsx";

interface InitialState {
  markers: MarkerCoords[];
  isFetching: boolean;
  imgParam: { x: number; y: number };
}

const initialState: InitialState = {
  markers: [],
  isFetching: false,
  imgParam: { x: 0, y: 0 },
};

export const deepnesSlice = createSlice({
  name: "deepnes",
  initialState,
  reducers: {
    setMarkers: (state, { payload }: PayloadAction<MarkerCoords[]>) => {
      state.markers = payload;
    },
    setFetching: (state, { payload }: PayloadAction<boolean>) => {
      state.isFetching = payload;
    },
    setImgParam: (
      state,
      {
        payload,
      }: PayloadAction<{
        x: number;
        y: number;
      }>
    ) => {
      state.imgParam = payload;
    },

    syncMarkers: (
      state,
      { payload: markers }: PayloadAction<MarkerValue[]>
    ) => {
      state.markers = state.markers.filter((markerCoord) => {
        return markers.some((marker) => marker.id === markerCoord.id);
      });

      state.markers.forEach((markerCoord) => {
        const marker = markers.find((marker) => marker.id === markerCoord.id);
        if (marker) {
          markerCoord.value = marker.value;
        }
      });
    },
  },
});

export const { setMarkers, syncMarkers, setFetching, setImgParam } =
  deepnesSlice.actions;
