import { createContext, useEffect, useRef } from "react";

interface IDialogProps {
	open: boolean;
	className?: string;
	onClose?: (event: MouseEvent) => void;
	children?: React.ReactNode;
}
type TDialogContext = {
	open: boolean;
	onClose?: (event: MouseEvent) => void;
}
const dialogContext = createContext<TDialogContext>({ open: false });

const Dialog = ({ open, children, className, onClose }:IDialogProps) => {
	const thisRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!thisRef.current || !open) return;
		const target = thisRef.current;
		const handler = (event: MouseEvent) => {
			if (event.target !== target) return;
			onClose && onClose(event);
		};
		target.addEventListener("click", handler);
		return () => target.removeEventListener("click", handler);
	}, [open]);

	return (
		<div ref={thisRef} className={className} aria-modal="true" role="dialog">
			<dialogContext.Provider value={{ open, onClose }}>
				{children}
			</dialogContext.Provider>
		</div>
	);
}
interface IDialogPanelProps {
	className?: string;
	children?: React.ReactNode;
}
Dialog.Panel = ({ className, children }:IDialogPanelProps) => {
	return <div className={className}>{children}</div>;
}
export default Dialog;