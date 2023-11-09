import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryConfig, getSessionToken } from './shared';
import { isNotEmptyString } from '../utils';
import { TProjectSchema } from '../types/projects';

type AccessToken = {
	access_token: string;
	token_type: string;
}

export const isAuthorised = () => isNotEmptyString(getSessionToken());
export type TUserRawData = {
	email: string;
	password: string;
	is_active: boolean;
	is_superuser: boolean;
	is_verified?: boolean;
}
export type TUserSchema = {
	id: string;
	email: string;
	is_active: boolean;
	is_superuser: boolean;
	is_verified: boolean;
	projects: Array<TProjectSchema>;
}
export type TUnathorizedResponse = {
	detail: "Unauthorized";
}

export const userApi = createApi({
	reducerPath: 'userApi',
	tagTypes: ["User"],
	baseQuery: fetchBaseQuery(baseQueryConfig),
	endpoints: (builder) => ({
			login: builder.mutation<AccessToken, FormData> ({
				query: (formData) =>({
						url:`/auth/jwt/login`,
						method: 'POST',
						headers: {},
						body: formData
					})
			}),
			logout: builder.mutation<string, void> ({
				query: () =>({
						url:`/auth/jwt/logout`,
						method: 'POST'
					})
			}),
			register: builder.mutation<TUserSchema, TUserRawData> ({
				query: (requestBody) =>({
						url:`/auth/register`,
						method: 'POST',
						body: requestBody
					}),
				invalidatesTags: ["User"],
			}),
			delete: builder.mutation<void, string> ({
				query: (userId) =>({
						url:`/users/${userId}`,
						method: 'DELETE'
					}),
				invalidatesTags: (result, _, userId) => result && [{ type: "User", id: userId }] || [],
			}),
			getCurrentUser: builder.query<TUserSchema | TUnathorizedResponse, void> ({
				query: () => `/users/me`,
				providesTags: (result) => result && !("detail" in result) && [{ type: "User", id: result.id }] || [],
			}),
			getAllUsers: builder.query<Array<TUserSchema> | TUnathorizedResponse, void> ({
				query: () => `/users`,
				providesTags: (result) => (result && !("detail" in result) && result?.map(record => ({ type: "User", id: record.id }))) || [],
			})
	}),
})

export const {
	useGetAllUsersQuery,
	useDeleteMutation,
	useLoginMutation,
	useLogoutMutation,
	useLazyGetCurrentUserQuery,
	useRegisterMutation } = userApi;