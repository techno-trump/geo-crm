import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import { api } from '../../config';
import { TBoxSchema } from '../../types/boxes';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { TLayerAlias, TLayerMeta, TToolAlias } from '.';

interface IEditorViewProps {
	boxData: TBoxSchema;
	activeTool: TToolAlias;
	activeLayerMeta?: TLayerMeta;
	layersToShow: Set<TLayerAlias>;
}

const setActiveTool = (instance: TIEInstance, toolAlias: TToolAlias, activeLayerMeta?: TLayerMeta) => {
		console.log(instance, toolAlias, activeLayerMeta);
	switch(toolAlias) {
		case "pencil":
			if (instance.getDrawingMode() !== 'FREE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('FREE_DRAWING');
			}
			instance.setBrush({ width: 6, color: activeLayerMeta?.color || "#FFF" });
			break;
		case "line":
			if (instance.getDrawingMode() !== 'LINE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('LINE_DRAWING');
			}
			instance.setBrush({ width: 6, color: activeLayerMeta?.color || "#FFF" });
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
		case "eraser":
			if (instance.getDrawingMode() !== 'FREE_DRAWING') {
				instance.stopDrawingMode();
				instance.startDrawingMode('FREE_DRAWING');
			}
			instance.setBrush({ width: 20, color: "#FFF" });
			break;
	}
}
const EditorView = forwardRef<TIEInstance, IEditorViewProps>(({
		boxData, activeTool, activeLayerMeta, layersToShow }, ref) => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const editorRef = useRef<TImageEditorWrap>(null);

	// Set active tool
	useEffect(() => {
		if (!editorRef.current || !isLoaded) return;
		const instance = editorRef.current.getInstance();
		setActiveTool(instance, activeTool, activeLayerMeta);
	}, [activeTool, activeLayerMeta]);

	// Add class, initial loading
	useEffect(() => {
		if (!editorRef.current) return;
		const rootElem = editorRef.current.getRootElement();
		rootElem.classList.add('markup-editor__editor-root');
		const instance = editorRef.current.getInstance();
		if (ref && "current" in ref) ref.current = instance;
		instance.loadImageFromURL(`/images/mask.jpg`, 'lena')
			.then(result => {
				setIsLoaded(true);
			});
	}, []);

	return <div className="markup-editor__viewport">
					<div className="training_img markup-editor__background">
						<img src={`${api.url}images/${boxData.image.id}`} />
						<ImageEditor ref={editorRef}
							cssMaxHeight={2000}
							cssMaxWidth={2000}
							usageStatistics={true}
						/>
					</div>
				</div>;
});
export default EditorView;