import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig } from './shared';
import { TFileSchema } from '../types/shared-types';

export const imagesApi = createApi({
	reducerPath: 'imagesApi',
	tagTypes: ["Image", "ImageFile"],
	baseQuery: fetchBaseQuery(baseQueryConfig),
	endpoints: (builder) => ({
			upload: builder.mutation<Array<TFileSchema>, FormData> ({
				query: (formData) =>({
						url:`/images`,
						method: 'POST',
						body: formData
					}),
				invalidatesTags: ["Image"],
			}),
			// update: builder.mutation<TBoreholeSchema, TBoreholeUpdateParams> ({
			// 	query: ({ boreholeId, requestBody }) =>({
			// 			url:`/boreholes?borehole_id=${boreholeId}`,
			// 			method: 'PUT',
			// 			body: requestBody
			// 		}),
			// 	invalidatesTags: (_, error, { boreholeId }) => error ? [] : [{ type: "Image", id: boreholeId }],
			// }),
			getById: builder.query<string, number> ({
				query: (imageId) => `/images/${imageId}`,
				providesTags: (result, _, imageId) => result && [{ type: "ImageFile", id: imageId }] || [],
			}),
	}),
})
export const {
	useUploadMutation,
	useGetByIdQuery
	} = imagesApi;