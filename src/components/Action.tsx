import clsx from "clsx";
import { TIcon } from "./icons/index.d";
import { TActionsMeta,
		TRawActionsMeta,
		TActionsContext
	} from "../types/actions";

export interface IActionProps {
	caption?: string;
	tooltip?: string;
	Icon?: TIcon;
	disabled?: boolean;
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export type TActionMeta = IActionProps;
export type TAction = typeof Action;
export const renderActions = (meta: TActionsMeta) => meta.map((metaItem, idx) => {
		const{ tooltip, caption, Icon } = metaItem;
		if (typeof metaItem.show == "boolean" && !metaItem.show) return null;
		return "actions" in metaItem ?
			<ActionsGroup key={idx} actions={metaItem.actions} Icon={Icon} /> :
			<Action
				key={idx}
				Icon={Icon}
				caption={caption}
				tooltip={tooltip}
				onClick={metaItem.onClick}
				/>;
	});
export const prepareActionsMeta = <T extends TActionsContext>(meta: TRawActionsMeta<T>, ctx: T): TActionsMeta => {
	return meta.map(metaItem => {
		const { caption, tooltip, show } = metaItem;
		if ("actions" in metaItem) {
			return {
				...metaItem,
				show: show ? show(ctx) : undefined,
				caption: caption && ctx.tMeta(caption),
				tooltip: tooltip && ctx.tMeta(tooltip),
				actions: prepareActionsMeta(metaItem.actions, ctx) as Array<TActionMeta> };
		} else {
			return {
				...metaItem,
				show: show ? show(ctx) : undefined,
				caption: caption && ctx.tMeta(caption),
				tooltip: tooltip && ctx.tMeta(tooltip),
				onClick: metaItem.onClickFactory(ctx)
			}
		}
	});
}
export const Action = ({ caption, Icon, onClick, disabled = false, tooltip }: IActionProps) => {
	return (
		<button
			className={clsx("__btn", !caption && "_icon")}
			onClick={onClick}
			disabled={disabled}
			data-legend={tooltip}
		>
			{Icon && <Icon />}
			{caption}
		</button>
	)
};
interface IActionsGroupProps extends Omit<IActionProps, "onClick"> {
	actions: Array<IActionProps>
}
export const ActionsGroup = ({ Icon, actions, caption, tooltip }: IActionsGroupProps) => {
	return (
		<div className={clsx("__btn", !caption && "_icon")}
			data-legend={tooltip}
		>
			{Icon && <Icon />}
			{caption}
			<ul>
				{actions.map(({ caption, onClick }, idx) => (
					<li key={idx}><button onClick={onClick}>{caption}</button></li>
				))}
			</ul>
		</div>
	)
};