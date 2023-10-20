import { TBoxSchema } from "../../types/boxes";
import { EditIcon, EraserIcon, MoveIcon, PointIcon, PolylineIcon, RectangleIcon, RefreshIcon, SaveIcon, UndoIcon } from "../icons";
import shared from "../../i18n/keys/shared";
import { useMetaTranslate } from "../../hooks";
import Select, { GroupBase, OptionProps, SingleValueProps } from "react-select";
import { useTranslation } from "react-i18next";
import { TIcon } from "../icons/index.d";
import { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { TTranslationKey } from "../../types/shared-types";
import EditorView from "./EditorView";
import clsx from "clsx";
import ImageEditor from "@toast-ui/react-image-editor";

export type TToolAlias = "pencil" | "line" | "rectangle" | "circle" | "eraser";
type TToolOptionRawMeta = {
	Icon: TIcon;
	name: TTranslationKey;
	alias: TToolAlias;
};
type TToolOptionMeta = {
	Icon: TIcon;
	name: string;
	alias: TToolAlias;
};

interface IToolSelectValueProps extends SingleValueProps<TToolOptionMeta, false, GroupBase<TToolOptionMeta>> {
}
const ToolSelectValue = ({ innerProps, data: { Icon, name } }: IToolSelectValueProps) => {
	return (
		<div {...innerProps} className="sketch-tool-select__value">
			<Icon />
			{name}
		</div>
	);
}
interface IToolSelectOptionProps extends OptionProps<TToolOptionMeta, false, GroupBase<TToolOptionMeta>> {
}
const ToolSelectOption = ({ innerProps, data: { Icon, name } }: IToolSelectOptionProps) => {
	return (
		<div {...innerProps} className="sketch-tool-select__option">
			<Icon />
			{name}
		</div>
	);
}
const toolsRawMeta: TToolOptionRawMeta[] = [
	{ alias: "pencil", name: { ns: shared.__ns, key: shared.pencil }, Icon: EditIcon },
	{ alias: "line", name: { ns: shared.__ns, key: shared.line }, Icon: PolylineIcon },
	{ alias: "rectangle", name: { ns: shared.__ns, key: shared.rectangle }, Icon: RectangleIcon },
	{ alias: "circle", name: { ns: shared.__ns, key: shared.circle }, Icon: PointIcon },
	{ alias: "eraser", name: { ns: shared.__ns, key: shared.eraser }, Icon: EraserIcon },
	// Tools.Arrow,
];
interface IToolSelectProps {
	setActiveTool: Dispatch<SetStateAction<TToolAlias>>;
}
const ToolSelect = ({ setActiveTool }: IToolSelectProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const tMeta = useMetaTranslate();
	const toolsMeta = toolsRawMeta.map((meta) => ({ ...meta, name: tMeta(meta.name) }));
	return (
		<div className="tools">
			<Select
				tabIndex={0}
				className="sketch-tool-select"
				classNamePrefix="sketch-tool-select"
				defaultValue={toolsMeta[0]}
				onChange={(selected) => setActiveTool(selected?.alias || "pencil")}
				placeholder={tShared(shared.tools)}
				options={toolsMeta}
				components={{
					Option: ToolSelectOption,
					SingleValue: ToolSelectValue
				}}
				//defaultValue={toolsMeta[0]}
				required
				/>
		</div>
	);
}

type TButtonStyle = CSSProperties & {
  '--btn_hover': string;
};
export type TLayerAlias = "core" | "cracks" | "solid-core" | "broken-core" | "tect" | "original";
export type TLayerMeta = {
	alias: TLayerAlias;
	name: TTranslationKey;
	color?: string;
}
const layersToDrawMeta: TLayerMeta[] = [
	{ alias: "core", name: { ns: shared.__ns, key: shared.core_material }, color: "#EAD045" },
	{ alias: "cracks", name: { ns: shared.__ns, key: shared.cracks }, color: "#EA5945" },
	{ alias: "solid-core", name: { ns: shared.__ns, key: shared.solid_core }, color: "#3AD24A" },
	{ alias: "broken-core", name: { ns: shared.__ns, key: shared.broken_core }, color: "#45A5EA" },
	{ alias: "tect", name: { ns: shared.__ns, key: shared.tect }, color: "#6045EA" },
]
const layersToShowMeta: TLayerMeta[] = [
	{ alias: "core", name: { ns: shared.__ns, key: shared.core_material }, color: "#EAD045" },
	{ alias: "cracks", name: { ns: shared.__ns, key: shared.cracks }, color: "#EA5945" },
	{ alias: "solid-core", name: { ns: shared.__ns, key: shared.solid_core }, color: "#3AD24A" },
	{ alias: "broken-core", name: { ns: shared.__ns, key: shared.broken_core }, color: "#45A5EA" },
	{ alias: "tect", name: { ns: shared.__ns, key: shared.tect }, color: "#6045EA" },
	{ alias: "original", name: { ns: shared.__ns, key: shared.show_original }, color: "#46A472" }
]

interface ILayersControlProps {
	activeLayer: TLayerAlias | null;
	layersToShow: Set<TLayerAlias>;
	setActiveLayer: Dispatch<SetStateAction<TLayerAlias | null>>;
	setLayersToShow: Dispatch<SetStateAction<Set<TLayerAlias>>>;
}

const LayerControl = ({ activeLayer, setActiveLayer, layersToShow, setLayersToShow }:ILayersControlProps) => {
	const tMeta = useMetaTranslate();
	const { t: tShared } = useTranslation(shared.__ns);
	return (
		<>
			<div className="training_left">
				<ul className="training_buttons">
					{
						layersToDrawMeta.map(({ alias, name, color }, idx) => {
							return <li key={idx}>
								<button
									type={"button"}
									onClick={() => setActiveLayer(alias)}
									className={clsx("__btn", activeLayer === alias && "active")}
									disabled={!layersToShow.has(alias)}
									style={{ "--btn_hover": color } as TButtonStyle}
								>{tMeta(name)}</button>
							</li>;
						})
					}
				</ul>
				<div className="training_subtitle">{tShared(shared.show_mask)}:</div>
				<ul className="training_mask">
					{
						layersToShowMeta.map(({ alias, name }, idx) => {
							return <li key={idx}>
												<label>
													<input
														type="checkbox"
														checked={layersToShow.has(alias)}
														onChange={({ target }) => setLayersToShow((current) => {
															if (!(target instanceof HTMLInputElement)) return current;
															const newSet = new Set(current);
															if (target.checked) {
																newSet.add(alias);
															} else {
																newSet.delete(alias);
															}
															return newSet;
														})}
														name={alias}
													/>
													<span>{tMeta(name)}</span>
												</label>
											</li>;
						})
					}
				</ul>
			</div>
		</>
	);
}

interface IActionsPanelProps {
	setActiveTool: Dispatch<SetStateAction<TToolAlias>>;
	undo: () => void;
	clear: () => void;
	save: () => void;
}
const ActionsPanel = ({ setActiveTool, undo, clear, save }:IActionsPanelProps) => {
	return (
		<section className="buttons __flex-align">
			<ToolSelect setActiveTool={setActiveTool} />
			<button type="button" onClick={undo} className="__btn _icon" data-legend="Отменить">
				<UndoIcon />
			</button>
			<button type="button" onClick={clear} className="__btn _icon" data-legend="Сбросить все">
				<RefreshIcon />
			</button>
			<button type="button" onClick={save} className="__btn _icon" data-legend="Сохранить">
				<SaveIcon />
			</button>
		</section>
	);
}
interface IMarkupEditorProps {
	boxData: TBoxSchema;
}
const MarkupEditor = ({ boxData }: IMarkupEditorProps) => {
	const editorInstanceRef = useRef<TIEInstance>(null);
	const [activeTool, setActiveTool] = useState<TToolAlias>("pencil");
	const [activeLayer, setActiveLayer] = useState<TLayerAlias | null>(null);
	const [layersToShow, setLayersToShow] = useState<Set<TLayerAlias>>(new Set(layersToShowMeta.map(({ alias }) => alias)));

	useEffect(() => {
		if (!layersToShow.has(activeLayer as TLayerAlias)) {
			setActiveLayer(null);
		}
	}, [activeLayer, layersToShow]);

	const undo = () => {
		if (editorInstanceRef.current) editorInstanceRef.current.undo();
	}
	const clear = () => {
		if (editorInstanceRef.current) editorInstanceRef.current.clearObjects();
	}
	const save = () => {
		if (editorInstanceRef.current) {
			const imgUrl = editorInstanceRef.current.toDataURL();
			console.log(imgUrl);
			window. open(imgUrl, "_blank");
		}
	}

	return (
		<div className="training wrapper markup-editor">
			<ActionsPanel setActiveTool={setActiveTool} undo={undo} clear={clear} save={save} />
			<section className="training_net __flex">
				<EditorView
					ref={editorInstanceRef}
					boxData={boxData}
					activeTool={activeTool}
					activeLayerMeta={layersToDrawMeta.find(item => item.alias === activeLayer)}
					layersToShow={layersToShow}
				/>
				<LayerControl
					activeLayer={activeLayer}
					setActiveLayer={setActiveLayer}
					layersToShow={layersToShow}
					setLayersToShow={setLayersToShow}
				/>
			</section>
		</div>
	);
} 
export default MarkupEditor;