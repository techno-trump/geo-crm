import { TFileSchema } from "./shared-types"

export type TBoreholeSchema = {
	"name": string,
	"depth": number,
	"id": number,
	"project_id": number,
	"images": Array<any>
}
export type TBoreholeRawData = {
	"name": string,
	"depth": number,
	"project_id": number,
	"images": Array<TFileSchema>
}