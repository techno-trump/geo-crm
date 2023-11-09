import { TBoxSchema } from "../../types/boxes";
import { EditIcon, EllipseIcon, EraserIcon, PolygonIcon, PolylineIcon, RectangleIcon, RefreshIcon, SaveIcon, UndoIcon } from "../icons";
import shared from "../../i18n/keys/shared";
import { useMetaTranslate } from "../../hooks";
import Select, { GroupBase, OptionProps, SingleValueProps } from "react-select";
import { useTranslation } from "react-i18next";
import { TIcon } from "../icons/index.d";
import { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { TTranslationKey } from "../../types/shared-types";
import EditorView, { TEditorContext } from "./EditorView";
import clsx from "clsx";
import { useUpdateMaskMutation } from "../../services/images";
import LoadingContainer from "../LoadingContainer";

export type TToolAlias = "polygon" | "pencil" | "line" | "rectangle" | "circle" | "eraser";
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
	{ alias: "polygon", name: { ns: shared.__ns, key: shared.polygon }, Icon: PolygonIcon },
	{ alias: "pencil", name: { ns: shared.__ns, key: shared.pencil }, Icon: EditIcon },
	{ alias: "line", name: { ns: shared.__ns, key: shared.line }, Icon: PolylineIcon },
	{ alias: "rectangle", name: { ns: shared.__ns, key: shared.rectangle }, Icon: RectangleIcon },
	{ alias: "circle", name: { ns: shared.__ns, key: shared.ellipse }, Icon: EllipseIcon },
	{ alias: "eraser", name: { ns: shared.__ns, key: shared.eraser }, Icon: EraserIcon },
	// Tools.Arrow,
];
interface IToolSelectProps {
	activeTool: TToolAlias;
	setActiveTool: Dispatch<SetStateAction<TToolAlias>>;
}
const ToolSelect = ({ activeTool, setActiveTool }: IToolSelectProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const tMeta = useMetaTranslate();
	const toolsMeta = toolsRawMeta.map((meta) => ({ ...meta, name: tMeta(meta.name) }));
	return (
		<div className="tools">
			<Select
				tabIndex={0}
				className="sketch-tool-select"
				classNamePrefix="sketch-tool-select"
				defaultValue={toolsMeta.find(item => item.alias === activeTool)}
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
export type TMaskType = "core" | "cracks" | "veins" | "destroyed" | "litotypes" | "original";
export type TLayerMeta = {
	alias: TMaskType;
	name: TTranslationKey;
	color?: string;
}
export const layersToDrawMeta: TLayerMeta[] = [
	{ alias: "veins", name: { ns: shared.__ns, key: shared.core_material }, color: "#EAD045" },
	{ alias: "cracks", name: { ns: shared.__ns, key: shared.cracks }, color: "#EA5945" },
	{ alias: "core", name: { ns: shared.__ns, key: shared.solid_core }, color: "#3AD24A" },
	{ alias: "destroyed", name: { ns: shared.__ns, key: shared.broken_core }, color: "#45A5EA" },
	{ alias: "litotypes", name: { ns: shared.__ns, key: shared.tect }, color: "#6045EA" },
]
const layersToShowMeta: TLayerMeta[] = [
	{ alias: "veins", name: { ns: shared.__ns, key: shared.core_material }, color: "#EAD045" },
	{ alias: "cracks", name: { ns: shared.__ns, key: shared.cracks }, color: "#EA5945" },
	{ alias: "core", name: { ns: shared.__ns, key: shared.solid_core }, color: "#3AD24A" },
	{ alias: "destroyed", name: { ns: shared.__ns, key: shared.broken_core }, color: "#45A5EA" },
	{ alias: "litotypes", name: { ns: shared.__ns, key: shared.tect }, color: "#6045EA" }
]

interface ILayersControlProps {
	showOriginal: boolean;
	toggleShowOriginal: () => void;
	activeLayer: TMaskType | null;
	layersToShow: Set<TMaskType>;
	setActiveLayer: Dispatch<SetStateAction<TMaskType | null>>;
	setLayersToShow: Dispatch<SetStateAction<Set<TMaskType>>>;
}

const LayerControl = ({ showOriginal, toggleShowOriginal, activeLayer, setActiveLayer, layersToShow, setLayersToShow }:ILayersControlProps) => {
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
					<li>
						<button
							type={"button"}
							onClick={toggleShowOriginal}
							className={clsx("__btn", showOriginal && "active")}
						>{tMeta({ ns: shared.__ns, key: shared.show_original })}</button>
					</li>
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
	activeTool: TToolAlias;
	setActiveTool: Dispatch<SetStateAction<TToolAlias>>;
	undo: () => void;
	clear: () => void;
	save: () => Promise<unknown>;
}
const ActionsPanel = ({ activeTool, setActiveTool, undo, clear, save }:IActionsPanelProps) => {
	const [saving, setSaving] = useState<boolean>(false);
	const handleSave = () => {
		setSaving(true);
		save().finally(() => setSaving(false));
	}

	return (
		<section className="buttons __flex-align">
			<ToolSelect activeTool={activeTool} setActiveTool={setActiveTool} />
			<button type="button" onClick={undo} className="__btn _icon" data-legend="Отменить">
				<UndoIcon />
			</button>
			<button type="button" onClick={clear} className="__btn _icon" data-legend="Сбросить все">
				<RefreshIcon />
			</button>
			<button type="button" disabled={saving} onClick={handleSave} className={clsx("__btn _icon", saving && "_busy")} data-legend="Сохранить">
				<SaveIcon />
				{saving && <LoadingContainer absolute={true} />}
			</button>
		</section>
	);
}
interface IMarkupEditorProps {
	boxData: TBoxSchema;
}
const MarkupEditor = ({ boxData }: IMarkupEditorProps) => {
	const ctxRef = useRef<TEditorContext | null>(null);
	const [_, setErrorState] = useState<{ msg: string, timer: number } | null>(null);
	const [showOriginal, setShowOriginal] = useState<boolean>(false);
	const [activeTool, setActiveTool] = useState<TToolAlias>("pencil");
	const [activeLayer, setActiveLayer] = useState<TMaskType | null>(null);
	const [layersToShow, setLayersToShow] = useState<Set<TMaskType>>(new Set(layersToShowMeta.map(({ alias }) => alias)));
	const toggleShowOriginal = () => setShowOriginal(current => !current);
	const [updateMaskQuery] = useUpdateMaskMutation();

	const getContext = (ctx: TEditorContext) => {
		ctxRef.current = ctx;
	};
	const updateMask = (maskType: TMaskType, imageUri: string) => {
		const imageBlob = dataURItoBlob(imageUri);
		// var blobUrl = URL.createObjectURL(imageBlob);
		// window.open(blobUrl, "_blank");
		const formData = new FormData();
		formData.append("mask_img", imageBlob);
		// formData.append("files", imageBlob);
		// return uploadImageQuery(formData).unwrap();
		return updateMaskQuery({ imageId: boxData.image.id, maskType, formData }).unwrap();
	}
	useEffect(() => {
		if (!layersToShow.has(activeLayer as TMaskType)) {
			setActiveLayer(null);
		}
	}, [activeLayer, layersToShow]);
	const getLayerCtx = (alias: TMaskType) => ctxRef.current && alias in ctxRef.current.layers && ctxRef.current.layers[alias] || null;
	const getActiveLayerCtx = () => activeLayer && getLayerCtx(activeLayer);
	const undo = () => {
		const activeLayerCtx = getActiveLayerCtx();
		if (!activeLayerCtx) return;
		activeLayerCtx.undo();
	}
	const clear = () => {
		const activeLayerCtx = getActiveLayerCtx();
		if (!activeLayerCtx) return;
		activeLayerCtx.clearObjects();
	}
	const saveLayer = (alias: TMaskType) => {
		const layerCtx = getLayerCtx(alias);
		if (!layerCtx) {
			return Promise.reject();
		}
		const imgUrl = layerCtx.toDataURL();
		return updateMask(alias, imgUrl);
	}
	const setError = (msg: string) => {
		setErrorState(current => {
			if (current) {
				clearTimeout(current.timer);
			}
			return { msg, timer: setTimeout(() => setErrorState(null), 5000) };
		});
	}
	const save = () => {
		if (!ctxRef.current) {
			setError("no_loaded_layers");
			return Promise.reject();
		}
		return Promise.all(layersToDrawMeta.map(({ alias}) => saveLayer(alias)))
			.then(_ => alert("Маски успешно сохранены"))
			.catch(reason => alert(`Ошибка при сохранении масок: ${JSON.stringify(reason)}`));
	}

	return (
		<div className="training wrapper markup-editor">
			<ActionsPanel activeTool={activeTool} setActiveTool={setActiveTool} undo={undo} clear={clear} save={save} />
			<section className="training_net __flex">
				<EditorView
					boxData={boxData}
					showOriginal={showOriginal}
					activeTool={activeTool}
					activeLayerMeta={layersToDrawMeta.find(item => item.alias === activeLayer)}
					layersToShow={layersToShow}
					getContext={getContext}
					setError={setError}
				/>
				<LayerControl
					showOriginal={showOriginal}
					toggleShowOriginal={toggleShowOriginal}
					activeLayer={activeLayer}
					setActiveLayer={setActiveLayer}
					layersToShow={layersToShow}
					setLayersToShow={setLayersToShow}
				/>
			</section>
		</div>
	);
}
function dataURItoBlob(dataURI: string) {
	// convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
	else
			byteString = decodeURI(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], {type:mimeString});
}
export default MarkupEditor;