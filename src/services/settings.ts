import { TLanguagesIsoCode } from "../i18n";

export const getSelectedLang = () => {
	return localStorage.getItem("lang") as TLanguagesIsoCode;
}