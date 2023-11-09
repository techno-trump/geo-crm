import clsx from "clsx";

interface ILoadingContainerProps {
	absolute?: boolean;
}
const LoadingContainer = ({ absolute }: ILoadingContainerProps) => {
	return (
		<div className={clsx("loading-container", absolute && "loading-container_absolute")}>
			<div className="spinner spinner_sm"></div>
		</div>
	);
}
export default LoadingContainer;