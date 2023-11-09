import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from "i18next-http-backend";
import { getSelectedLang } from '../services/settings';
//import LanguageDetector from 'i18next-browser-languagedetector';

export type TLanguagesIsoCode = "ru" | "en";
export type TLanguages = {
	[key in TLanguagesIsoCode]: { nativeName: string; }
}
export const langs: TLanguages = {
  en: { nativeName: 'English' },
  ru: { nativeName: 'Russian' }
};

i18n
	// i18next-http-backend
  // loads translations from your server
  // https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  //.use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
		//ns: ['shared', 'settings', 'roles', 'projects', 'boreholes'],
    fallbackLng: getSelectedLang() || "ru",
		saveMissing: true,
		react: {
			useSuspense: true,
	 	},
		backend: {
      backendOptions: [{
        loadPath: '/locales/{{lng}}/{{ns}}.json'
      }]
    }
  });

export default i18n;