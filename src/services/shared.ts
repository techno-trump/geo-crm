import { api } from "../config";
import { FetchBaseQueryArgs } from "@reduxjs/toolkit/dist/query/fetchBaseQuery";

export const getSessionToken = () => {
	return localStorage.getItem("token");
};
export const setSessionToken = (token: string) => {
	return localStorage.setItem("token", token);
};

export const baseQueryConfig: FetchBaseQueryArgs = {
	baseUrl: api.url,
	prepareHeaders: (headers) => {
		const sesssionToken = getSessionToken();
		if (sesssionToken) headers.set('Authorization', `Bearer ${sesssionToken}`);
		return headers;
	},
	headers: {
			// 'Content-Type': 'application/json',
			// Accept: 'application/json',
			// "Access-Control-Allow-Origin": "*",
	}
};