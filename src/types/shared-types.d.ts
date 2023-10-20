export interface IRCBaseProps {
	children?: React.ReactNode;
	className?: string;
}

export type TTranslationKey = { ns: string; key: string; };

export type TFileSchema = {
	"name": string;
	"id": number;
}