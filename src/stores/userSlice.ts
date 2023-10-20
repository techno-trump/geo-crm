import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { isAuthorised } from "../services/user";
import { TProjectSchema } from "../types/projects";

type UserState = {
	isAuthorized: boolean;
	id: string | null;
	email: string | null;
	is_active: string | null;
	is_verified: string | null;
	is_superuser: string | null;
	projects: Array<TProjectSchema>;
};

const initialState: UserState = {
	isAuthorized: isAuthorised(),
	id: null,
	email: null,
	is_active: null,
	is_verified: null,
	is_superuser: null,
	projects: [],
};

export const logOut = createAsyncThunk(
	'user/logOut',
	async (_, thunkAPI) => {
		localStorage.removeItem("token");
		return thunkAPI.dispatch(setUnauthorized());
	}
);

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
			setAuthorized: (state) => {
				state.isAuthorized = true;
			},
			setUnauthorized: (state) => {
				state.isAuthorized = false;
			},
			setData: (state, { payload }) => {
				Object.assign(state, payload);
			},
		},
    extraReducers(builder) {
			builder.addCase(logOut.fulfilled, (state) => { state.isAuthorized = false })
		},
});

export const selectIsAuthorized = (state: RootState) => state.user.isAuthorized;
export const selectUserData = (state: RootState) => state.user;
export const selectUserEmail = (state: RootState) => state.user.email;
export const selectUserId = (state: RootState) => state.user.id;
export const selectUserProjects = (state: RootState) => state.user.projects;

export const { setAuthorized, setUnauthorized, setData } = userSlice.actions;

export default userSlice.reducer;