export type TBoxRawData = {
	"interval_from": number;
  "interval_to": number;
  "length": number;
  "image": TFileSchema;
  "borehole_id": number;
}
export type TBoxSchema = {
	"id": number;
	"scr": number;
  "vein_material": number;
	"status": string;
} & TBoxRawData;


