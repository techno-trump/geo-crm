import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig } from './shared';
import { TBoxSchema, TBoxRawData } from '../types/boxes';

export type TBoxUpdateAttributes = TBoxRawData;
export type TBoxUpdateParams = {
	id: number;
	data: TBoxUpdateAttributes;
}

export const boxesApi = createApi({
	reducerPath: 'boxesApi',
	tagTypes: ["Box"],
	baseQuery: fetchBaseQuery(baseQueryConfig),
	endpoints: (builder) => ({
			// create: builder.mutation<TBoxSchema, TBoreholeRawData> ({
			// 	query: (requestBody) =>({
			// 			url:`/boreholes`,
			// 			method: 'POST',
			// 			body: requestBody
			// 		}),
			// 	invalidatesTags: ["Borehole"],
			// }),
			update: builder.mutation<TBoxSchema, TBoxUpdateParams> ({
				query: ({ id, data }) =>({
						url:`/boxes?box_id=${id}`,
						method: 'PUT',
						body: data
					}),
				invalidatesTags: (_, error, { id }) => error ? [] : [{ type: "Box", id }],
			}),
			delete: builder.mutation<string, Array<number>> ({
				query: (ids) =>({
						url:`/boxes?box_ids=${ids}`,
						method: 'DELETE'
					}),
				invalidatesTags: (_, error, ids) => error ? [] : ids.map(id => ({ type: "Box", id })),
			}),
			getByBorehole: builder.query<Array<TBoxSchema>, number> ({
				query: (id) => `/boxes?borehole_id=${id}`,
				providesTags: (result) => result && result.map(data => ({ type: "Box", id: data.id })) || [],
			}),
			getById: builder.query<TBoxSchema, number> ({
				query: (id) => `/boxes/${id}`,
				providesTags: (_, error, id) => error ? [] : [{ type: "Box", id }],
			}),
			recalculate: builder.mutation<string, Array<number>> ({
				query: (ids) =>({
						url:`/boxes/calculation`,
						method: 'POST',
						body: {
							box_ids: ids
						}
					}),
				invalidatesTags: (_, error, ids) => error ? [] : ids.map(id => ({ type: "Box", id })),
			}),
	}),
})
export const {
	useGetByIdQuery,
	useGetByBoreholeQuery,
	useUpdateMutation,
	useDeleteMutation,
	useRecalculateMutation
	} = boxesApi;