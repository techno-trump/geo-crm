import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { TLanguagesIsoCode } from "../i18n";
import i18n from '../i18n';
import { getSelectedLang } from "../services/settings";
type TSettingsState = {
	lang: TLanguagesIsoCode;
}
const initialState: TSettingsState = {
	lang: getSelectedLang(),
};

export const changeLang = createAsyncThunk(
	'settings/changeLang',
	async (lang: TLanguagesIsoCode, thunkAPI) => {
		localStorage.setItem("lang", lang);
		i18n.changeLanguage(lang);
		return thunkAPI.dispatch(setLang(lang));
	}
);

export const settingSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
			setLang: (state, { payload }) => {
				state.lang = payload;
			},
		}
});

export const selectLang = (state: RootState) => state.settings.lang;

export const { setLang } = settingSlice.actions;

export default settingSlice.reducer;