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
			// get: builder.query<Array<TProjectSchema>, void> ({
			// 	query: () => `/projects`,
			// 	providesTags: (result) => result && !("detail" in result) && [{ type: "Project", id: result.id }] || [],
			// }),
	}),
})
export const {
	useCreateMutation
	} = projectsApi;
