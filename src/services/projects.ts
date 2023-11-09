import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig } from './shared';
import { TProjectRawData, TProjectSchema } from '../types/projects';



export const projectsApi = createApi({
	reducerPath: 'projectsApi',
	tagTypes: ["Project"],
	baseQuery: fetchBaseQuery(baseQueryConfig),
	endpoints: (builder) => ({
			create: builder.mutation<TProjectSchema, TProjectRawData> ({
				query: (requestBody) =>({
						url:`/projects`,
						method: 'POST',
						body: requestBody
					}),
				invalidatesTags: ["Project"],
			}),
			get: builder.query<Array<TProjectSchema>, { skip?: number; limit?: number; } | void> ({
				query: ({ skip, limit } = {}) => `/projects?skip=${skip || 0}&limit=${limit || 100}`,
				providesTags: (result) => result && !("detail" in result) && result.map(record => ({ type: "Project", id: record.id })) || [],
			}),
	}),
})
export const {
	useCreateMutation,
	useGetQuery
	} = projectsApi;
