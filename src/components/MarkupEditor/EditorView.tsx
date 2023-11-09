import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import { api } from '../../config';
import { TBoxSchema } from '../../types/boxes';
import { useEffect, useRef, useState } from 'react';
import { TMaskType, TLayerMeta, TToolAlias, layersToDrawMeta } from '.';
import clsx from 'clsx';

const setActiveTool = (instance: TIEInstance, toolAlias: TToolAlias, activeLayerMeta?: TLayerMeta) => {
	switch(toolAlias) {
		case "pencil":
			if (instance.getDrawingMode() !== 'FREE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('FREE_DRAWING');
			}
			instance.setBrush({ width: 10, color: activeLayerMeta?.color || "#FFF" });
			break;
		case "line":
			if (instance.getDrawingMode() !== 'LINE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('LINE_DRAWING');
			}
			instance.setBrush({ width: 10, color: activeLayerMeta?.color || "#FFF" });
			break;
		case "rectangle":
		case "circle":
			if (instance.getDrawingMode() !== 'SHAPE') {
				instance.stopDrawingMode();
				instance.startDrawingMode('SHAPE');
			}
			instance.setDrawingShape(toolAlias ==="rectangle" ? 'rect' : "circle", {
				width: 6,
				strokeWidth: 6,
				stroke: activeLayerMeta?.color || "#FFF",
				fill: activeLayerMeta?.color || "#FFF",
			});
			break;
		case "polygon":
			if (instance.getDrawingMode() !== 'SHAPE') {
				instance.stopDrawingMode();
				instance.startDrawingMode('SHAPE');
			}
			instance.setDrawingShape("polygon", {
				width: 6,
				strokeWidth: 6,
				stroke: activeLayerMeta?.color || "#FFF",
				fill: activeLayerMeta?.color || "#FFF",
			});
			break;
		case "eraser":
			if (instance.getDrawingMode() !== 'FREE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('FREE_DRAWING');
			}
			instance.setBrush({ width: 20, color: "#FFF" });
			break;
	}
}
interface IImageEditorWrapProps {
	imageId: number;
	activeTool: TToolAlias;
	visible: boolean;
	active: boolean;
	layerMeta: TLayerMeta;
	addLayer: (alias: TMaskType, instance: TIEInstance) => void;
	setError?: (msg: string) => void;
	showOriginal: boolean;
}
const ImageEditorWrap = ({ activeTool, imageId, visible, active, layerMeta, addLayer, showOriginal }: IImageEditorWrapProps) => {
	const [_, setIsLoaded] = useState<boolean>(false);
	const editorRef = useRef<TImageEditorRoot>(null);
	
	// Set active tool
	useEffect(() => {
		if (!editorRef.current) return;
		const instance = editorRef.current.getInstance();
		setActiveTool(instance, activeTool, layerMeta);
	}, [activeTool, layerMeta]);

	
	useEffect(() => {
		let isCanceled = false;
		if (!editorRef.current) return;
		const rootElem = editorRef.current.getRootElement();
		rootElem.classList.add('markup-editor__editor-root');
		const instance = editorRef.current.getInstance();
		instance.loadImageFromURL(`https://agolikov.com/mask/?image_id=${imageId}&mask_type=${layerMeta.alias}`, 'mask')
			.then(() => {
				if (isCanceled) return;
				setIsLoaded(true);
				addLayer(layerMeta.alias, instance);
			})
			.catch(reason => {
				if (isCanceled) return;
				alert(`Ошибка при загрузке маски (${layerMeta.alias}): ${reason}`);
			});
		return () => { isCanceled = true };
	}, []);

	return (
		<div className={clsx("markup-editor__editor-wrap", active && "markup-editor__editor-wrap_active", !showOriginal && visible && "markup-editor__editor-wrap_visible")}>
			<ImageEditor ref={editorRef}
				cssMaxHeight={2000}
				cssMaxWidth={2000}
				usageStatistics={true}
			/>
		</div>
	);
};

export type TEditorContext = {
	layers: { [key in TMaskType]?: TIEInstance };
}
const initialContext: TEditorContext = {
	layers: {},
}
const useEditorContext = (initial: TEditorContext) => {
	const interfaceRef = useRef<TEditorContext>(initial);
	return interfaceRef.current;
}
interface IEditorViewProps {
	boxData: TBoxSchema;
	showOriginal: boolean;
	activeTool: TToolAlias;
	activeLayerMeta?: TLayerMeta;
	layersToShow: Set<TMaskType>;
	getContext: (ctx: TEditorContext) => void;
	setError: (msg: string) => void;
}
const EditorView = ({ boxData, showOriginal, layersToShow, activeTool, activeLayerMeta, getContext, setError }: IEditorViewProps) => {
	const ctx = useEditorContext(initialContext);
	const addLayer = (alias: TMaskType, instance: TIEInstance) => {
			console.log(ctx.layers[alias], instance, ctx.layers[alias] === instance);
		ctx.layers[alias] = instance;
	}

	useEffect(() => {
		getContext(ctx);
	}, []);

	return <div className="markup-editor__viewport">
					<div className="training_img markup-editor__background">
						<img src={`${api.url}images/${boxData.image.id}`} className={clsx("markup-editor__img", "markup-editor__img_show")} />
						{
							layersToDrawMeta.map((meta, idx) =>
								<ImageEditorWrap
									key={idx}
									activeTool={activeTool}
									visible={layersToShow.has(meta.alias)}
									active={activeLayerMeta?.alias === meta.alias}
									showOriginal={showOriginal}
									imageId={boxData.image.id}
									layerMeta={meta}
									addLayer={addLayer}
									setError={setError}
									/>)
						}
					</div>
				</div>;
};



export default EditorView;