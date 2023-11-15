import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import { api } from '../../config';
import { TBoxSchema } from '../../types/boxes';
import { useEffect, useRef, useState } from 'react';
import { TMaskType, TLayerMeta, TToolAlias, layersToDrawMeta } from '.';
import clsx from 'clsx';

const setActiveTool = (instance: TIEInstance, toolAlias: TToolAlias, toolSize: number, activeLayerMeta?: TLayerMeta) => {
	switch(toolAlias) {
		case "pencil":
			if (instance.getDrawingMode() !== 'FREE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('FREE_DRAWING');
			}
			instance.setBrush({ width: toolSize, color: activeLayerMeta?.color || "#FFF" });
			break;
		case "line":
			if (instance.getDrawingMode() !== 'LINE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('LINE_DRAWING');
			}
			instance.setBrush({ width: toolSize, color: activeLayerMeta?.color || "#FFF" });
			break;
		case "rectangle":
		case "circle":
			if (instance.getDrawingMode() !== 'SHAPE') {
				instance.stopDrawingMode();
				instance.startDrawingMode('SHAPE');
			}
			instance.setDrawingShape(toolAlias ==="rectangle" ? 'rect' : "circle", {
				width: 20,
				strokeWidth: toolSize,
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
				width: 20,
				strokeWidth: toolSize,
				stroke: activeLayerMeta?.color || "#FFF",
				fill: activeLayerMeta?.color || "#FFF",
			});
			break;
		case "eraser":
			if (instance.getDrawingMode() !== 'FREE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('FREE_DRAWING');
			}
			instance.setBrush({ width: toolSize, color: "#FFF" });
			break;
		case "zoom":
			instance.stopDrawingMode();
			break;

	}
}

interface IImageEditorWrapProps {
	imageId: number;
	activeTool: TToolAlias;
	toolSize: number;
	visible: boolean;
	active: boolean;
	layerMeta: TLayerMeta;
	addLayer: (alias: TMaskType, instance: TIEInstance) => void;
	setError?: (msg: string) => void;
	showOriginal: boolean;
}
interface IPositionZoom {
	x: number;
	y: number;
}

interface IZoomViewApi {
	getTransform: () => string;
	update: () => void;
	pan: (amount: IPositionZoom) => void;
	scaleAt: (at: IPositionZoom, amount: number) => void;
}

const useZoomView = (() => {
	const apiRef = useRef<IZoomViewApi | null>(null);
	if (apiRef.current) return apiRef.current;
	return apiRef.current = (() => {
		const matrix: number[] = [1, 0, 0, 1, 0, 0]; // current view transform
		const m = matrix; // alias
		let scale = 1; // current scale
		const pos: IPositionZoom = { x: 0, y: 0 }; // current position of origin
		let dirty = true;

		const API = {
			getTransform() {
				if (dirty) {
					this.update();
				}
				if (m[0] <= 1) {
					m[0] = 1;
				}
				if (m[3] <= 1) {
					m[3] = 1;
				}
				if (m[0] === 1) {
					m[4] = 0;
					m[5] = 0;
				}
				return `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
			},
			update() {
				dirty = false;
				m[3] = m[0] = scale;
				m[2] = m[1] = 0;
				m[4] = pos.x;
				m[5] = pos.y;
			},
			pan(amount: IPositionZoom) {
				if (dirty) {
					this.update();
				}
				pos.x += amount.x;
				pos.y += amount.y;
				dirty = true;

				if (m[0] === 1 && m[3] === 1) {
					pos.x = 0;
					pos.y = 0;
				}
			},
			scaleAt(at: IPositionZoom, amount: number) {
				if (dirty) {
					this.update();
				}
				scale *= amount;
				pos.x = at.x - (at.x - pos.x) * amount;
				pos.y = at.y - (at.y - pos.y) * amount;
				dirty = true;
			},
		};

		return API;
	})();
});
const ImageEditorWrap = ({ activeTool, toolSize, imageId, visible, active, layerMeta, addLayer, showOriginal }: IImageEditorWrapProps) => {
	const [_, setIsLoaded] = useState<boolean>(false);
	const editorRef = useRef<TImageEditorRoot>(null);
	
	// Set active tool
	useEffect(() => {
		if (!editorRef.current) return;
		const instance = editorRef.current.getInstance();
		setActiveTool(instance, activeTool, toolSize, layerMeta);
	}, [activeTool, toolSize, layerMeta]);

	
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
	toolSize: number;
	activeLayerMeta?: TLayerMeta;
	layersToShow: Set<TMaskType>;
	getContext: (ctx: TEditorContext) => void;
	setError: (msg: string) => void;
}
const EditorView = ({ boxData, showOriginal, layersToShow, activeTool, toolSize, activeLayerMeta, getContext, setError }: IEditorViewProps) => {
	const zoomMeRef = useRef<HTMLDivElement>(null);
	const zoomView = useZoomView();
	const [zoomTransform, setZoomTransform] = useState<string>("");
	const ctx = useEditorContext(initialContext);
	const addLayer = (alias: TMaskType, instance: TIEInstance) => {
		ctx.layers[alias] = instance;
	}

	useEffect(() => {
		if (activeTool !== "zoom") return;
		const mouse: {
			x: number;
			y: number;
			oldX: number;
			oldY: number;
			button: boolean;
		} = {
			x: 0,
			y: 0,
			oldX: 0,
			oldY: 0,
			button: false,
		};
		const mouseHandler = (event: MouseEvent) => {
			if (event.type === "mousedown") {
				mouse.button = true;
			}
			if (event.type === "mouseup" || event.type === "mouseout") {
				mouse.button = false;
			}
			mouse.oldX = mouse.x;
			mouse.oldY = mouse.y;
			mouse.x = event.pageX;
			mouse.y = event.pageY;
		
			if (mouse.button) {
				zoomView.pan({ x: mouse.x - mouse.oldX, y: mouse.y - mouse.oldY });
				setZoomTransform(zoomView.getTransform());
			}
			event.preventDefault();
		}
		const mouseWheelHandler = (event: WheelEvent) => {
			const x = event.pageX - (zoomMeRef.current?.clientWidth || 0) / 2;
			const y = event.pageY - (zoomMeRef.current?.clientHeight || 0) / 2;

			if (event.deltaY < 0) {
				zoomView.scaleAt({ x, y }, 1.1);
				setZoomTransform(zoomView.getTransform());
			} else {
				zoomView.scaleAt({ x, y }, 1 / 1.1);
				setZoomTransform(zoomView.getTransform());
			}
			event.preventDefault();
		}

		document.addEventListener("mousemove", mouseHandler, { passive: false });
		document.addEventListener("mousedown", mouseHandler, { passive: false });
		document.addEventListener("mouseup", mouseHandler, { passive: false });
		document.addEventListener("mouseout", mouseHandler, { passive: false });
		document.addEventListener("wheel", mouseWheelHandler, { passive: false });
		
		return () => {
			document.removeEventListener("mousemove", mouseHandler);
			document.removeEventListener("mousedown", mouseHandler);
			document.removeEventListener("mouseup", mouseHandler);
			document.removeEventListener("mouseout", mouseHandler);
			document.removeEventListener("wheel", mouseWheelHandler);
		};
	}, [activeTool]);

	useEffect(() => {
		getContext(ctx);
	}, []);

	return <div className="markup-editor__viewport">
				<div ref={zoomMeRef} style={{ transform: zoomTransform, cursor: activeTool === "zoom" ? "grab" : "default" }} className="training_img markup-editor__background">
					<img src={`${api.url}images/${boxData.image.id}`} className={clsx("markup-editor__img", "markup-editor__img_show")} />
					{
						layersToDrawMeta.map((meta, idx) =>
							<ImageEditorWrap
								key={idx}
								activeTool={activeTool}
								toolSize={toolSize}
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