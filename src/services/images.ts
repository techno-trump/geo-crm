import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig } from './shared';
import { TFileSchema, TMaskSchema } from '../types/shared-types';
import { TMaskType } from '../components/MarkupEditor';

export const imagesApi = createApi({
	reducerPath: 'imagesApi',
	tagTypes: ["Image", "ImageFile", "Mask"],
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
			getMasksByImage: builder.query<Array<TMaskSchema>, number> ({
				query: (imageId) => `/mask?image_id=${imageId}`,
				providesTags: (result) => result && result.map(record => ({ type: "Mask", id: record.id })) || [],
			}),
			updateMask: builder.mutation<Array<TFileSchema>, { imageId: number, maskType: TMaskType, formData: FormData }> ({
				query: ({ imageId, maskType, formData }) =>({
						url: `/mask?image_id=${imageId}&mask_type=${maskType}`,
						method: 'PUT',
						body: formData
					}),
				invalidatesTags: ["Mask"],
			}),
	}),
})
export const {
	useUploadMutation,
	useGetByIdQuery,
	useGetMasksByImageQuery,
	useUpdateMaskMutation,
	} = imagesApi;