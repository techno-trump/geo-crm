export type TBoxRawData = {
	"interval_from": number;
  "interval_to": number;
  "length": number;
  "image": TFileSchema;
  "borehole_id": number;
	"status": string;
	"scr": number;
  "vein_material": number;
	"number": number;
}
export type TBoxSchema = {
	"id": number;
	//"status": string;
} & TBoxRawData;


