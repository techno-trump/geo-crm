import clsx from "clsx";
import "./style.scss";

interface IImageBoxProps {
	name: string;
	src: string;
	show: boolean;
	onClose: () => void;
}
export const ImageBox = ({ name, src, show, onClose }: IImageBoxProps) => {
	return (
		<div className={clsx("imagebox", show && "imagebox_visible")}>
			<button className="imagebox__close-btn" onClick={onClose}>
				Close
			</button>
			<img src={src} alt={name} />
		</div>
	);
}