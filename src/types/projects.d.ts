export type TProjectType = "core" | "sludge" | "outcrops" | "other";
export type TProjectOption = { value: TProjectType; label: string; };
export type TProjectSchema = {
	name: string;
	type: TProjectType;
	id: 0;
	owner_id: 0;
}
export type TProjectRawData = {
	"name": "string";
  "type": "string";
}