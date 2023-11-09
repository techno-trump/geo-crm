export interface IRCBaseProps {
	children?: React.ReactNode;
	className?: string;
}

export type TTranslationKey = { ns: string; key: string; };

export type TFileSchema = {
	"name": string;
	"id": number;
}

export type TMaskSchema = {
	"mask_type": "string",
	"image_id": 0,
	"data": [
		"string"
	],
	"id": 0
};