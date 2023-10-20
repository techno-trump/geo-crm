export type TRecord = object & { id: number };
export type TSelectedRecords = Array<TRecord>;
export type TListActionsContext = {
	selected: TSelectedRecords;
	deleteRecords: function;
	navigate: NavigateFunction;
	tMeta: TTranslateMeta;
}
export type TEditActionsContext = {
	data: TRecord;
	deleteRecords: function;
	navigate: NavigateFunction;
	tMeta: TTranslateMeta;
}
export type TNewActionsContext = {
	navigate: NavigateFunction;
	tMeta: TTranslateMeta;
}
export type TReportActionsContext = {
	data: any;
	navigate: NavigateFunction;
	tMeta: TTranslateMeta;
}
export type TActionsContext = TListActionsContext | TEditActionsContext | TNewActionsContext | TReportActionsContext;
export type TActionMeta = {
	Icon?: TIcon;
	caption?: string;
	tooltip?: string;
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};
export type TRawActionMeta<Context> = {
	Icon?: TIcon;
	caption?: TTranslationKey;
	tooltip?: TTranslationKey;
	onClickFactory: (ctx: Context) =>
		(event: React.MouseEvent<HTMLButtonElement>) => void;
};
export type TActionsGroupMeta = {
	Icon?: TIcon;
	caption?: string;
	tooltip?: string;
	actions: Array<TActionMeta>;
};
export type TRawActionsGroupMeta<Context> = {
	Icon?: TIcon;
	caption?: TTranslationKey;
	tooltip?: TTranslationKey;
	actions: Array<TRawActionMeta<Context>>;
};
export type TRawActionsMeta<Context> = Array<TRawActionMeta<Context> | TRawActionsGroupMeta<Context>>;
export type TActionsMeta = Array<TActionMeta | TActionsGroupMeta>;