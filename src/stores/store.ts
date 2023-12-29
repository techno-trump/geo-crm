import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import userReducer from "./userSlice";
import settingReducer from "./settingsSlice";
import { userApi } from "../services/user";
import { projectsApi } from "../services/projects";
import { boreholesApi } from "../services/boreholes";
import { imagesApi } from "../services/images";
import { boxesApi } from "../services/boxes";
import { cellsApi } from "../services/cells";
import { intervalsApi } from "../services/intervals";
import { deepnessMarkupApi } from "../services/deepnesMarkup.ts";
import { deepnesSlice } from "./deepnesSlice.ts";

export const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingReducer,
    deepness: deepnesSlice.reducer,
    // API
    [userApi.reducerPath]: userApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [boreholesApi.reducerPath]: boreholesApi.reducer,
    [imagesApi.reducerPath]: imagesApi.reducer,
    [boxesApi.reducerPath]: boxesApi.reducer,
    [cellsApi.reducerPath]: cellsApi.reducer,
    [intervalsApi.reducerPath]: intervalsApi.reducer,
    [deepnessMarkupApi.reducerPath]: deepnessMarkupApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(projectsApi.middleware)
      .concat(boreholesApi.middleware)
      .concat(imagesApi.middleware)
      .concat(boxesApi.middleware)
      .concat(cellsApi.middleware)
      .concat(intervalsApi.middleware)
      .concat(deepnessMarkupApi.middleware),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
