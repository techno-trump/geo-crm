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
		case "zoom":
			instance.stopDrawingMode();
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
interface IPositionZoom {
x: number;
y: number;
}

const zoomView = (() => {
const matrix: number[] = [1, 0, 0, 1, 0, 0]; // current view transform
const m = matrix; // alias
let scale = 1; // current scale
const pos: IPositionZoom = { x: 0, y: 0 }; // current position of origin
let dirty = true;

const API = {
	applyTo(el: HTMLElement) {
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
	el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
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
	const [isZoom, setZoom] = useState(false);

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

	function mouseEvent(event: MouseEvent) {
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
		// pan
		const zoomMe = document.getElementById("zoomMe") as HTMLElement;
		zoomView.pan({ x: mouse.x - mouse.oldX, y: mouse.y - mouse.oldY });
		zoomView.applyTo(zoomMe);
		}

		event.preventDefault();
	}

	function mouseWheelEvent(event: WheelEvent) {
		const zoomMe = document.getElementById("zoomMe") as HTMLElement;
		const x = event.pageX - zoomMe.clientWidth / 2;
		const y = event.pageY - zoomMe.clientHeight / 2;

		if (event.deltaY < 0) {
		zoomView.scaleAt({ x, y }, 1.1);
		zoomView.applyTo(zoomMe);
		} else {
		zoomView.scaleAt({ x, y }, 1 / 1.1);
		zoomView.applyTo(zoomMe);
		}

		event.preventDefault();
	}

	useEffect(() => {
		if (isZoom) {
		document.addEventListener("mousemove", mouseEvent, { passive: false });
		document.addEventListener("mousedown", mouseEvent, { passive: false });
		document.addEventListener("mouseup", mouseEvent, { passive: false });
		document.addEventListener("mouseout", mouseEvent, { passive: false });
		document.addEventListener("wheel", mouseWheelEvent, { passive: false });
		} else {
		document.removeEventListener("mousemove", mouseEvent);
		document.removeEventListener("mousedown", mouseEvent);
		document.removeEventListener("mouseup", mouseEvent);
		document.removeEventListener("mouseout", mouseEvent);
		document.removeEventListener("wheel", mouseWheelEvent);
		}

		return function () {
		document.removeEventListener("mousemove", mouseEvent);
		document.removeEventListener("mousedown", mouseEvent);
		document.removeEventListener("mouseup", mouseEvent);
		document.removeEventListener("mouseout", mouseEvent);
		document.removeEventListener("wheel", mouseWheelEvent);
		};
	}, [isZoom]);

	const setDisableZoom = () => {
		console.log("выкл");
		setZoom(false);
	};
	const setEnableZoom = () => {
		console.log("вкл");
		setZoom(true);
	};

	useEffect(() => {
		const tools = document.querySelectorAll<HTMLElement>(
		".markup-editor__tools button"
		);

		Array.from(tools)
		.slice(0, 6)
		.forEach((tool) => {
			tool.addEventListener("click", setDisableZoom);
		});
		console.log(tools);
		const zoomTool = tools[6];

		if (zoomTool) {
		zoomTool.addEventListener("click", setEnableZoom);
		}

		return function () {
		Array.from(tools).forEach((tool) => {
			tool.removeEventListener("click", setDisableZoom);
		});

		if (zoomTool) {
			zoomTool.removeEventListener("click", setEnableZoom);
		}
		};
	}, []);

	useEffect(() => {
		getContext(ctx);
	}, []);

	return <div className="markup-editor__viewport">
					<div className="training_img markup-editor__background" id="zoomMe">
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