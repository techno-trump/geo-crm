import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { baseQueryConfig } from "./shared.ts";

interface TDeepnessDotBody {
  x_px: number;
  y_px: number;
  depth_m: number;
  image_id: number;
}

export interface TDeepnessDotResponse extends TDeepnessDotBody {
  id: number;
}

export const deepnessMarkupApi = createApi({
  reducerPath: "deepnessMarkupApi",
  tagTypes: ["Marker"],
  baseQuery: fetchBaseQuery(baseQueryConfig),
  endpoints: (builder) => ({
    createDot: builder.mutation<TDeepnessDotResponse, TDeepnessDotBody>({
      query: (requestBody) => ({
        url: `/depth_dots?image_id=${requestBody.image_id}`,
        method: "POST",
        body: requestBody,
      }),
      // invalidatesTags: ["Marker"],
    }),

    deleteDot: builder.mutation<string, string>({
      query: (queryString) => ({
        url: `/depth_dots?${queryString}`,
        method: "DELETE",
      }),
    }),

    getDots: builder.query<Array<TDeepnessDotResponse>, number>({
      query: (imageId) => `/depth_dots?image_id=${imageId}`,
      providesTags: ["Marker"],
    }),
  }),
});
