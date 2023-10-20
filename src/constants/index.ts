import { TProjectType } from "../types/projects";
import projects from "../i18n/keys/projects";

export type TProjectTypeMap = { [key: string]: TProjectType; };

export const projectType: TProjectTypeMap = {
	CORE: "core",
	SLUDGE: "sludge",
	OUTCROPS: "outcrops",
	OTHER: "other"
}
type TProjectTypesData = {
	alias: TProjectType;
	nameLangKey: keyof typeof projects;
	name: string;
}
export const projectTypes: Array<TProjectTypesData> = [
	{ alias: "core", nameLangKey: "core", name: "Керн" },
	{ alias: "sludge", nameLangKey: "sludge", name: "Шлам" },
	{ alias: "outcrops", nameLangKey: "outcrops", name: "Геологические обнажения" },
	{ alias: "other", nameLangKey: "other", name: "Другие" }
];
export const userRoles = [
	{ alias: "admin", nameLangKey: "admin", name: "Администратор" },
	{ alias: "user", nameLangKey: "user", name: "Пользователь" },
]