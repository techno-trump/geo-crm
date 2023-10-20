import { useTranslation } from "react-i18next";
import { useGetByBoxQuery } from "../services/cells";
import shared from "../i18n/keys/shared";
import LoadingContainer from "./LoadingContainer";
import { TBoxSchema } from "../types/boxes";
import { TBoreholeSchema } from "../types/boreholes";
import { Dispatch, SetStateAction, useState } from "react";
import clsx from "clsx";
import HistogramChart from "./HistogramChart";
import { TFillingFilter, TIntervalSchema } from "../types/interval";
import { EditIcon, LayersIcon, LeftAngledBreaketIcon, RightAngledBreaketIcon } from "./icons";
import LoadableImage from "./LoadableImage";
import ActionsPanel from "./ActionsPanel";
import { TTranslationKey } from "../types/shared-types";
import { useMetaTranslate } from "../hooks";
import { TRawActionsMeta, TReportActionsContext } from "../types/actions";
import boxes from "../i18n/keys/boxes";
import { prepareActionsMeta } from "./Action";
import { useNavigate } from "react-router-dom";
import { TCellSchema } from "../types/cells";
import { toFixed } from "../utils";

interface IPaginationPagesProps {
	cellsNumber: number;
	activeCell: number;
	setActiveCell: Dispatch<SetStateAction<number>>;
}
const PaginationPages = ({ cellsNumber, setActiveCell, activeCell }:IPaginationPagesProps) => {
	return (
		<ul className="histogram_pagination __flex-center">
			{ Array.from({ length: cellsNumber }).map((_, idx) =>
				<li key={idx}>
					<button
						type={"button"}
						className={clsx("__btn", activeCell === idx && "active")}
						onClick={() => setActiveCell(idx)}
					>
						{idx + 1}
					</button>
				</li>)
			}
		</ul>
	);
}
interface IPaginationButtonsProps {
	cellsNumber: number;
	setActiveCell: Dispatch<SetStateAction<number>>;
}
const PaginationButtons = ({ cellsNumber, setActiveCell }:IPaginationButtonsProps) => {
	const handleNextCell = () => {
		setActiveCell((current) => current < cellsNumber - 1 ? current + 1 : current);
	};
	const handlePrevCell = () => {
		setActiveCell((current) => current > 0 ? current - 1 : current);
	};

	return (
		<div className="histogram_arrows __flex-center">
			<button type={"button"} onClick={handlePrevCell} className="__btn _icon">
				<LeftAngledBreaketIcon />
			</button>
			<button type={"button"} onClick={handleNextCell} className="__btn _icon">
				<RightAngledBreaketIcon />
			</button>
		</div>
	);
}
type TFilterMeta = {
	alias: TFillingFilter;
	shortName: string;
	tooltip: TTranslationKey;
}
const filtersMeta: Array<TFilterMeta> = [
	{ alias: "Vn", shortName: "Vn", tooltip: { ns: shared.__ns, key: shared.vn } },
	{ alias: "SCR", shortName: "SCR", tooltip: { ns: shared.__ns, key: shared.scr } },
	{ alias: "Fr", shortName: "Fr", tooltip: { ns: shared.__ns, key: shared.fr } },
	{ alias: "Tect", shortName: "Tect", tooltip: { ns: shared.__ns, key: shared.tect } }
];
interface IFilterSelectorProps {
	activeFilter: string;
	setActiveFilter: Dispatch<SetStateAction<TFillingFilter>>;
}
const FilterSelector = ({ activeFilter, setActiveFilter }: IFilterSelectorProps) => {
	const tMeta = useMetaTranslate();
	return (
		<div className="sludge_type">
			{
				filtersMeta.map(({ alias, tooltip, shortName }, idx) =>
					<button type={"button"}
						key={idx}
						data-legend={tMeta(tooltip)}
						className={clsx(activeFilter === alias && "active")}
						onClick={() => setActiveFilter(alias)}
					>
						{shortName}
					</button>)
			}
		</div>
	);
}
const filtersMap: { [key in TFillingFilter]: (intervalData: TIntervalSchema) => number } = {
	"Vn": (intervalData: TIntervalSchema) => intervalData.vien,
	"SCR": (intervalData: TIntervalSchema) => intervalData.solid_core,
	"Fr": (intervalData: TIntervalSchema) => intervalData.broken_core,
	"Tect": (intervalData: TIntervalSchema) => intervalData.breccia + intervalData.cataclosite + intervalData.mylonite, 
};
interface IHistogramProps {
	boxData: TBoxSchema;
	boreholeData: TBoreholeSchema;
}
interface ITableProps {
	cellData: TCellSchema;
}
const Table = ({ cellData }: ITableProps) => {
	//const intervalsData = cellsData.reduce((result, current) => result.concat(current.intervals), [] as Array<TIntervalSchema>);
	return (
		<table>
			<thead>
				<tr>
					<th>
						<span>From_m</span>
					</th>
					<th>
						<span>To_m</span>
					</th>
					<th>
						<span>SolidCore_perc</span>
					</th>
					<th>
						<span>BrokenCore_perc</span>
					</th>
					<th>
						<span>Fractures_qnt</span>
					</th>
					<th>
						<span>Veins_perc</span>
					</th>
					<th>
						<span>Breccia_perc</span>
					</th>
					<th>
						<span>Cataclasite_perc</span>
					</th>
					<th>
						<span>Milonite_perc</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{
					cellData?.intervals.map((record, intervalIdx) => (
							<tr key={intervalIdx}>
								<td>{toFixed(record.interval_from, 2)}</td>
								<td>{toFixed(record.interval_to, 2)}</td>
								<td>{toFixed(record.solid_core, 2)}</td>
								<td>{toFixed(record.broken_core, 2)}</td>
								<td>{toFixed(record.vien_quantity, 2)}</td>
								<td>{toFixed(record.vien, 2)}</td>
								<td>{toFixed(record.breccia, 2)}</td>
								<td>{toFixed(record.cataclosite, 2)}</td>
								<td>{toFixed(record.mylonite, 2)}</td>
							</tr>
						))
				}
			</tbody>
		</table>
	);
}

const rawActionsMeta: TRawActionsMeta<TReportActionsContext> = [
	{
		tooltip: { ns: shared.__ns, key: shared.navigate_to_column },
		Icon: LayersIcon,
		onClickFactory: ({ navigate, data }) => () => { navigate(`/boreholes/${(data as TBoxSchema).borehole_id}/column`) },
	},
	{
		Icon: EditIcon,
		actions: [
			{
				caption: { ns: boxes.__ns, key: boxes.edit_interval },
				onClickFactory: ({ navigate }) => () => { navigate(`edit`) },
			},
			{
				caption: { ns: boxes.__ns, key: boxes.edit_markup },
				onClickFactory: ({ navigate }) => () => { navigate(`markup`) },
			}
		]
	}
];

const Histogram = ({ boxData }: IHistogramProps) => {
	const navigate = useNavigate();
	const [activeCell, setActiveCell] = useState<number>(0);
	const [activeFilter, setActiveFilter] = useState<TFillingFilter>("Vn");
	const { t: tShared } = useTranslation(shared.__ns);
	const tMeta = useMetaTranslate();
	const cellsQueryResult = useGetByBoxQuery(boxData.id);

	if (cellsQueryResult.isLoading) {
		return <LoadingContainer />
	}
	if (cellsQueryResult.isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(cellsQueryResult.error)}</div>;
	}
	if (!cellsQueryResult.data) {
		return <div>Something went wrong. No cells data to show</div>;
	}
	if (!cellsQueryResult.data.length) {
		return <div>No cells to show</div>;
	}

	const activeCellData = cellsQueryResult.data[activeCell];
	const [intervals, values] = activeCellData?.intervals.reduce((result, interval) => {
		result[0].push(interval.interval_from);
		result[1].push(filtersMap[activeFilter](interval));
		return result;
	}, [[] as Array<number>, [] as Array<number>]) || [[], []];

	return (
		<div className="histogram_net __flex-start">
			<div className="histogram_char">
				{<PaginationPages cellsNumber={cellsQueryResult.data.length} activeCell={activeCell} setActiveCell={setActiveCell} />}
				<HistogramChart intervals={intervals} values={values} />
			</div>
			<div className="histogram_images __grid-twoo">
				<PaginationButtons cellsNumber={cellsQueryResult.data.length} setActiveCell={setActiveCell} />
				{ activeCellData &&
					<>
						<LoadableImage {...activeCellData.image} />
						<LoadableImage {...activeCellData.image} />
					</>
				}
			</div>
			<div className="histogram_table">
				<ActionsPanel className="histogram_buttons buttons __flex" meta={prepareActionsMeta(rawActionsMeta, { navigate, data: boxData, tMeta })} />
				<Table cellData={activeCellData} />
			</div>
			<FilterSelector activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
		</div>
	);
}

export default Histogram;