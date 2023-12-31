export type TRecord = object & { id: number };
export type TSelectedRecords = Array<TRecord>;
export type TListActionsContext = {
  selected: TSelectedRecords;
  deleteRecords: function;
  navigate: NavigateFunction;
  tMeta: TTranslateMeta;
};
export type TEditActionsContext = {
  data: TRecord;
  deleteRecords: function;
  addRecord?: function;
  saveHandler?: function;
  navigate: NavigateFunction;
  tMeta: TTranslateMeta;
};
export type TNewActionsContext = {
  navigate: NavigateFunction;
  tMeta: TTranslateMeta;
};
export type TReportActionsContext = {
  data: any;
  navigate: NavigateFunction;
  tMeta: TTranslateMeta;
};
export type TActionsContext =
  | TListActionsContext
  | TEditActionsContext
  | TNewActionsContext
  | TReportActionsContext;
export type TActionMeta = {
  Icon?: TIcon;
  caption?: string;
  tooltip?: string;
  show?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};
export type TRawActionMeta<Context> = {
  Icon?: TIcon;
  caption?: TTranslationKey;
  tooltip?: TTranslationKey;
  show?: (ctx: Context) => boolean;
  onClickFactory: (
    ctx: Context
  ) => (event: React.MouseEvent<HTMLButtonElement>) => void;
};
export type TActionsGroupMeta = {
  Icon?: TIcon;
  caption?: string;
  tooltip?: string;
  show?: boolean;
  actions: Array<TActionMeta>;
};
export type TRawActionsGroupMeta<Context> = {
  Icon?: TIcon;
  caption?: TTranslationKey;
  tooltip?: TTranslationKey;
  show?: (ctx: Context) => boolean;
  actions: Array<TRawActionMeta<Context>>;
};
export type TRawActionsMeta<Context> = Array<
  TRawActionMeta<Context> | TRawActionsGroupMeta<Context>
>;
export type TActionsMeta = Array<TActionMeta | TActionsGroupMeta>;
