type TMode = 'CROPPER' | 'FREE_DRAWING' | 'LINE_DRAWING' | 'TEXT' | 'SHAPE';
type TShape = 'rect' | 'circle' | 'triangle' | 'polygon';
type TShapeDrawingModeOptions = {
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	width?: number;
	height?: number;
	rx?: number;
	ry?: number;
	isRegular?: number;
}
type TDrawingModeOptions = {
	width: number;
	color: string;
	arrowType?: { tail?: string; head?: string; };
}
type TBrushOptions = {
	width: number;
	color: string;
}
type TToDataURLOptions = {
	format?: string;
	quality?: number;
	multiplier?: number;
	left?: number;
	top?: number;
	width?: number;
	height?: number;
}
type TSizeChange = {
}
type TErrorMsg = {
}
type TIEInstance = {
	loadImageFromURL: (url: string, imageName: string) => Promise.<TSizeChange | TErrorMsg>;
	startDrawingMode: (mode: TMode, options?: TDrawingModeOptions) => boolean;
	stopDrawingMode: () => void;
	getDrawingMode: () => TMode;
	setBrush: (options?: TBrushOptions) => boolean;
	setDrawingShape: (type: TShape, options?: TShapeDrawingModeOptions) => void;
	undo: (iterationCount?: number) => void;
	clearObjects: () => void;
	toDataURL: (options?: TToDataURLOptions) => string;
	destroy: () => void;
}
type TImageEditorRoot = {
	getInstance: () => TIEInstance;
	getRootElement: () => HTMLElement;
}
interface IImageEditorProps {
	ref: React.Ref<IIEWrap>;
	cssMaxHeight: number;
	cssMaxWidth: number;
	usageStatistics: boolean;
}
declare module '@toast-ui/react-image-editor' {
	const ImageEditor: React.ComponentType<IImageEditorProps>;
  export default ImageEditor;
};