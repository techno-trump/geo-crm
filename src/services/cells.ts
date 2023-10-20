import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig } from './shared';
import { TCellSchema } from '../types/cells';

export const cellsApi = createApi({
	reducerPath: 'cellsApi',
	tagTypes: ["Cell"],
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
			// update: builder.mutation<TBoxSchema, TBoxUpdateParams> ({
			// 	query: ({ id, data }) =>({
			// 			url:`/boxes?box_id=${id}`,
			// 			method: 'PUT',
			// 			body: data
			// 		}),
			// 	invalidatesTags: (_, error, { id }) => error ? [] : [{ type: "Box", id }],
			// }),
			// delete: builder.mutation<string, Array<number>> ({
			// 	query: (ids) =>({
			// 			url:`/boxes?box_ids=${ids}`,
			// 			method: 'DELETE'
			// 		}),
			// 	invalidatesTags: (_, error, ids) => error ? [] : ids.map(id => ({ type: "Box", id })),
			// }),
			getByBox: builder.query<Array<TCellSchema>, number> ({
				query: (id) => `/cells?box_id=${id}`,
				providesTags: (result) => result && result.map(data => ({ type: "Cell", id: data.id })) || [],
			}),
			// getById: builder.query<TBoxSchema, number> ({
			// 	query: (id) => `/boxes/${id}`,
			// 	providesTags: (_, error, id) => error ? [] : [{ type: "Box", id }],
			// }),
	}),
})
export const {
	useGetByBoxQuery
	} = cellsApi;