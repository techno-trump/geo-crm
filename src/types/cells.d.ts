import { TIntervalSchema } from "./interval";
import { TFileSchema } from "./shared-types";

export type TCellSchema = {
	"id": number,
	"image": TFileSchema,
	"box_id": number,
	"intervals": Array<TIntervalSchema>
};


