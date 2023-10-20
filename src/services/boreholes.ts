import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig } from './shared';
import { TBoreholeRawData, TBoreholeSchema } from '../types/boreholes';

export type TBoreholeUpdateAttributes = Omit<TBoreholeRawData, "project_id" | "images">;
export type TBoreholeUpdateParams = {
	id: number;
	data: TBoreholeUpdateAttributes;
}

export const boreholesApi = createApi({
	reducerPath: 'boreholesApi',
	tagTypes: ["Borehole"],
	baseQuery: fetchBaseQuery(baseQueryConfig),
	endpoints: (builder) => ({
			create: builder.mutation<TBoreholeSchema, TBoreholeRawData> ({
				query: (requestBody) =>({
						url:`/boreholes`,
						method: 'POST',
						body: requestBody
					}),
				invalidatesTags: ["Borehole"],
			}),
			update: builder.mutation<TBoreholeSchema, TBoreholeUpdateParams> ({
				query: ({ id, data }) =>({
						url:`/boreholes?borehole_id=${id}`,
						method: 'PUT',
						body: data
					}),
				invalidatesTags: (_, error, { id }) => error ? [] : [{ type: "Borehole", id }],
			}),
			getByProject: builder.query<Array<TBoreholeSchema>, number> ({
				query: (projectId) => `/boreholes?project_id=${projectId}`,
				providesTags: (result) => result && result.map(data => ({ type: "Borehole", id: data.id })) || [],
			}),
			getById: builder.query<TBoreholeSchema, number> ({
				query: (boreholeId) => `/boreholes/${boreholeId}`,
				providesTags: (result) => result && [{ type: "Borehole", id: result.id }] || [],
			}),
	}),
})
export const {
	useCreateMutation,
	useGetByIdQuery,
	useLazyGetByProjectQuery,
	useUpdateMutation,
	useGetByProjectQuery
	} = boreholesApi;