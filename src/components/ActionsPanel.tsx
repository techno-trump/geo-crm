import { TActionsMeta } from "../types/actions";
import { renderActions } from "./Action";

interface IActionsPanelProps {
	meta: TActionsMeta;
	className?: string;
}

const ActionsPanel = ({ meta, className }: IActionsPanelProps) => {
	return (
		<section className={className}>
			{renderActions(meta)}
		</section>
	);
}
export default ActionsPanel;