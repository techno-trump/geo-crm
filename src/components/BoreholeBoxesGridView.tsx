import { useTranslation } from 'react-i18next';
import shared from "../i18n/keys/shared";
import { ActionsGroup, prepareActionsMeta } from "./Action";
import { AddIcon, EditIcon, LayersIcon, RefreshIcon, RemoveIcon, ZoomInIcon } from "./icons";
import { useMetaTranslate } from "../hooks";
import clsx from "clsx";
import { TBoxSchema } from "../types/boxes";
import { useDeleteMutation, useGetByBoreholeQuery, useRecalculateMutation } from '../services/boxes';
import { Link, useNavigate } from 'react-router-dom';
import LoadingContainer from './LoadingContainer';
import { toFixed } from '../utils';
import { useEffect, useState } from 'react';
import LoadableImage from './LoadableImage';
import {
	TRawActionsMeta,
	TListActionsContext
} from "../types/actions";
import boxes from '../i18n/keys/boxes';
import ActionsPanel from './ActionsPanel';

const rawActionsMeta: TRawActionsMeta<TListActionsContext & { recalculate: Function, boreholeId: number }> = [
	{
		caption: { ns: shared.__ns, key: shared.classify },
		Icon: RefreshIcon,
		onClickFactory: ({ selected, recalculate }) => () => {
				recalculate(selected.map(record => record.id)).unwrap()
					.then(() => alert("Классификация успешно инициализирована"))
					.catch((reason: object) => alert(`Ошибка при запуске классификации:\n${JSON.stringify(reason)}`));
			},
	},
	{
		tooltip: { ns: shared.__ns, key: shared.remove },
		Icon: RemoveIcon,
		onClickFactory: ({ selected, deleteRecords, tMeta }) => () => {
			if (!selected.length) return alert(tMeta({ ns: "shared", key: "no_selected_records" }));
			if (confirm(tMeta({ ns: "shared", key: "confirm_records_removal" }))) {
				deleteRecords((selected as Array<TBoxSchema>).map(data => data.id));
			}
		},
	},
	{
		tooltip: { ns: shared.__ns, key: shared.navigate_to_column },
		Icon: LayersIcon,
		onClickFactory: ({ navigate }) => () => { navigate("column") },
	},
	{
		tooltip: { ns: boxes.__ns, key: boxes.add_box },
		Icon: AddIcon,
		onClickFactory: ({ navigate, boreholeId }) => () => { navigate("/boxes/new", { state: { boreholeId } }) },
	},
];

type TRecognitionStatus = "success" | "error" | "processing" | "created";
interface IRecognitionStatusIndicator {
	status: TRecognitionStatus;
}
const RecognitionStatusIndicator = ({ status }: IRecognitionStatusIndicator) => {
	const { t: tShared } = useTranslation(shared.__ns);
	return (
		<span className={clsx(
			status === "success" && "_ok",
			status === "processing" && "_procces",
			status === "created" && "_procces",
			status === "error" && "_error"
			)}>{tShared(shared[status])}</span>
	);
}
interface IMainTableRowProps {
	number: number;
	boxData: TBoxSchema;
	selected: boolean;
	toggleSelector: () => void;
}
const MainTableRow = ({ boxData, number, selected = false, toggleSelector }:IMainTableRowProps) => {
	const { t: tBoxes } = useTranslation(boxes.__ns);
	const navigate = useNavigate();

	return (
		<>
			<tr>
				<td rowSpan={2}>
					<label>
						<input type="checkbox" checked={selected} onChange={toggleSelector} name="box"/>
						<span></span>
					</label>
				</td>
				<td rowSpan={2}>{number}</td>
				<td rowSpan={2}>
					<div className="box_img">
						<LoadableImage { ...boxData.image } />
						<div className="box_buttons">
							{boxData.status == "success" && <ActionsGroup Icon={EditIcon} actions={[
								{ caption: tBoxes(boxes.edit_interval), onClick: () => navigate(`box/${boxData.id}/edit`) },
								{ caption: tBoxes(boxes.edit_markup), onClick: () => navigate(`/boxes/${boxData.id}/markup`) },
								{ caption: tBoxes(boxes.edit_deepnes_markup), onClick: () => navigate(`/boxes/${boxData.id}/deepnes-markup`) }
							]} ></ActionsGroup>}
							<Link className="__btn _icon" to={`/boxes/${boxData.id}`}>
								<ZoomInIcon />
							</Link>
						</div>
					</div>
				</td>
				<td>{boxData.interval_from}-{boxData.interval_to}</td>
				<td>{toFixed(boxData.length, 2)}</td>
				<td>{toFixed(boxData.scr, 2)}</td>
				<td>{toFixed(boxData.vein_material, 2)}</td>
			</tr>
			<tr>
				<td colSpan={4}>
					<RecognitionStatusIndicator status={boxData.status as TRecognitionStatus} />
				</td>
			</tr>
		</>
	);
}
interface IMinTableRowProps {
	number: number;
	boxData: TBoxSchema;
}
const MinTableRow = ({ boxData, number }: IMinTableRowProps) => {
	const { t: tShared } = useTranslation(shared.__ns);

	return (
		<tr>
			<td>{boxData.interval_from}-{boxData.interval_to}</td>
			<td>{number}</td>
			<td>{boxData.image.name}</td>
			<td>{boxData.status === "success" ? tShared(shared.yes) : tShared(shared.no)}</td>
		</tr>
	);
}

interface IBoreholeBoxesGridViewprops {
	boreholeId: number;
}
const BoreholeBoxesGridView = ({ boreholeId }: IBoreholeBoxesGridViewprops) => {
	const navigate = useNavigate();
	const tMeta = useMetaTranslate();
	const [deleteRecords] = useDeleteMutation();
	const [recalculate] = useRecalculateMutation();
	const { data: boxesData, isFetching, isError, isSuccess } = useGetByBoreholeQuery(boreholeId);
	const [selected, setSelected] = useState<Array<boolean>>(Array.from({ length: boxesData?.length || 0 }));
	const allSelected = Boolean(selected.length) && selected.every(value => value);
	const actionsMeta = prepareActionsMeta(rawActionsMeta, {
		navigate,
		selected: boxesData && boxesData.filter((_, idx) => selected[idx]) || [],
		deleteRecords,
		recalculate,
		tMeta,
		boreholeId
	});

	useEffect(() => {
		setSelected(() => Array.from({ length: boxesData?.length || 0 }).map((_, idx) => selected[idx] || false));
	}, [boxesData]);

	const toggleAllHandler = () => {
		setSelected(() => selected.map(() => !allSelected));
	}

	const renderBody = () => {
		return (
			<>
				<section className="box">
					<table>
						<thead>
							<tr>
								<th>
									<label>
										<input type="checkbox" name="box-all" checked={allSelected} onChange={toggleAllHandler}/>
										<span></span>
									</label>
								</th>
								<th>№ <br/>ящика</th>
								<th></th>
								<th>интервал <br/>(м)</th>
								<th>длина <br/>(м)</th>
								<th>SCR <br/>(%)</th>
								<th>жильный <br/>метариал (%)</th>
							</tr>
						</thead>
						<tbody>
							{boxesData && boxesData.map((boxData, idx) =>
								<MainTableRow
									key={idx}
									number={idx + 1}
									selected={selected[idx]}
									toggleSelector={() => setSelected((current) => {
										const newSelected = current.slice(0);
										newSelected[idx] = !newSelected[idx];
										return newSelected;
									})}
									boxData={boxData}
								/>)}
						</tbody>
					</table>
				</section>    
				<section className="well_table">
					<table>
						<thead>
							<tr>
								<th>интервал <br/>(м)</th>
								<th>№ <br/>ящика</th>
								<th>название <br/>изображения</th>
								<th>интервал <br/>в наличии</th>
							</tr>
						</thead>
						<tbody>
							{
								boxesData && boxesData.map((boxData, idx) =>
								<MinTableRow key={idx} number={idx + 1} boxData={boxData} />)
							}
						</tbody>
					</table>           
				</section>
			</>
		);
	}

	return (
		<>
			<ActionsPanel className="buttons __flex-align" meta={actionsMeta} />
			<div className="well_net __flex">
				{
					isError && "Ошибка загрузки" ||
					isFetching && <LoadingContainer /> ||
					isSuccess && renderBody()
				}
			</div>
		</>
	);
};

export default BoreholeBoxesGridView;
