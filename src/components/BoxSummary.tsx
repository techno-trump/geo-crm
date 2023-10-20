import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import boreholes from "../i18n/keys/boreholes";
import boxes from "../i18n/keys/boxes";
import { TBoxSchema } from "../types/boxes";
import shared from "../i18n/keys/shared";
import { EditIcon, HistogramIcon, LayersIcon, RefreshIcon, RemoveIcon } from "./icons";
import { TRawActionsMeta, TEditActionsContext } from "../types/actions";
import { useMetaTranslate } from "../hooks";
import { prepareActionsMeta } from "./Action";
import { useDeleteMutation } from "../services/boxes";
import ActionsPanel from "./ActionsPanel";
import { useGetByCellQuery } from "../services/intervals";
import { toFixed } from "../utils";
import cells from "../i18n/keys/cells";
import { useGetByBoxQuery } from "../services/cells";
import LoadableImage from "./LoadableImage";
import { TFileSchema } from "../types/shared-types";
import { useGetByIdQuery } from "../services/boreholes";
import LoadingContainer from "./LoadingContainer";

interface IBoxMasksProps {
	mainImg: TFileSchema;
}
const BoxMasks = ({ mainImg }:IBoxMasksProps) => {
	return (
		<section className="case_net __flex">
			<div className="case_images">
				<div className="case_img">
					<LoadableImage {...mainImg} />
				</div>
				{/* <div className="case_img" style="display: none;">
					<img src="/images/p1.jpg" alt srcSet="/images/p1.jpg 1x, /images/p1@2x.jpg 2x"/>
				</div>
				<div className="case_img" style="display: none;">
					<img src="/images/p2.jpg" alt srcSet="/images/p2.jpg 1x, /images/p2@2x.jpg 2x"/>
				</div>
				<div className="case_img" style="display: none;">
					<img src="/images/i1.jpg" alt srcSet="/images/i1.jpg 1x, /images/i1@2x.jpg 2x"/>
				</div> */}
			</div>
			<ul className="case_buttons">
				<li>
					<button data-legend="Тектониты">Vn</button>
				</li>
				<li>
					<button data-legend="Тектониты">SCR</button>
				</li>
				<li>
					<button data-legend="Тектониты">Fr</button>
				</li>
				<li>
					<button data-legend="Тектониты">Tect</button>
				</li>
			</ul>
		</section>
	);
}

interface ICellIntevalsProps {
	boreholeName: string;
	boxNumber: number;
	cellNumber: number;
	cellId: number;
}
const CellIntevals = ({ boreholeName, boxNumber, cellId, cellNumber }: ICellIntevalsProps) => {
	const { data } = useGetByCellQuery(cellId);
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { t: tBoxes } = useTranslation(boxes.__ns);
	const { t: tCells } = useTranslation(cells.__ns);

	return (
		<section className="case_table">
			<div className="case_title">
				{tBoreholes(boreholes.borehole)}<b>{boreholeName}</b>
				{tBoxes(boxes.box)}<b>{boxNumber}</b>
				{tCells(cells.cell)}<b>{cellNumber}</b></div>
			<table>
				<thead>
					<tr>
						<th>From_m</th>
						<th>To_m</th>
						<th>SolidCore_perc</th>
						<th>BrokenCore_perc</th>
						<th>Fractures_qnt</th>
						<th>Veins_perc</th>
						<th>Breccia_perc</th>
						<th>Cataclasite_perc</th>
						<th>Milonite_perc</th>
					</tr>
				</thead>
					<tbody>
						{
							data?.map((record, idx) => (
								<tr key={idx}>
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
		</section>
	);
}


interface IBoxSummaryProps {
	boxData: TBoxSchema;
}
const rawActionsMeta: TRawActionsMeta<TEditActionsContext> = [
	{
		caption: { ns: shared.__ns, key: shared.classify },
		Icon: RefreshIcon,
		onClickFactory: (_) => () => {},
	},
	{
		tooltip: { ns: shared.__ns, key: shared.remove },
		Icon: RemoveIcon,
		onClickFactory: ({ data, deleteRecords, tMeta }) => () => {
			if (confirm(tMeta({ ns: "shared", key: "confirm_records_removal" }))) {
				deleteRecords((data.id));
			}
		},
	},
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
				onClickFactory: ({ navigate }) => () => navigate(`edit`),
			},
			{
				caption: { ns: boxes.__ns, key: boxes.edit_markup },
				onClickFactory: ({ navigate, data }) => () => navigate(`/boxes/${(data as TBoxSchema).id}/markup`),
			}
		]
	},
	{
		tooltip: { ns: boxes.__ns, key: boxes.histogram },
		Icon: HistogramIcon,
		onClickFactory: ({ navigate }) => () => { navigate("histogram") },
	}
];

const BoxSummary = ({ boxData }: IBoxSummaryProps) => {
	const navigate = useNavigate();
	const tMeta = useMetaTranslate();
	const [deleteRecords] = useDeleteMutation();
	const cellsQueryResult = useGetByBoxQuery(boxData.id);
	const boreholeQueryResult = useGetByIdQuery(boxData.borehole_id);

	const actionsContext = {
		data: boxData,
		navigate,
		tMeta,
		deleteRecords
	}

	const actionsMeta = prepareActionsMeta(rawActionsMeta, actionsContext);

	if (cellsQueryResult.isError || boreholeQueryResult.isError) {
		return <>
			{cellsQueryResult.isError && <div>Error loading cells: {JSON.stringify(cellsQueryResult.error)}</div>}
			{cellsQueryResult.isError && <div>Error loading borehole data: {JSON.stringify(boreholeQueryResult.error)}</div>}
		</>
	}
	if (cellsQueryResult.isLoading || boreholeQueryResult.isLoading) {
		return <LoadingContainer />	
	}
	if (!cellsQueryResult.data || !boreholeQueryResult.data) {
		return <div>Something went wrong, data is unawailable</div>;
	}

	return (
		<>
			<ActionsPanel className="buttons __flex-align" meta={actionsMeta} />
			<BoxMasks mainImg={boxData.image} />
			{cellsQueryResult.data.map((record, idx) =>
				<CellIntevals
					key={idx}
					boreholeName={boreholeQueryResult.data.name}
					boxNumber={boxData.id}
					cellId={record.id}
					cellNumber={idx + 1}
				/>)}
		</>
	);
};

export default BoxSummary;