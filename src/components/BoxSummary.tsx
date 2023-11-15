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
import { useDeleteMutation, useRecalculateMutation } from "../services/boxes";
import ActionsPanel from "./ActionsPanel";
import { useGetByCellQuery } from "../services/intervals";
import { toFixed } from "../utils";
import cells from "../i18n/keys/cells";
import { useGetByBoxQuery } from "../services/cells";
import LoadableImage from "./LoadableImage";
import { TFileSchema } from "../types/shared-types";
import { useGetByIdQuery } from "../services/boreholes";
import LoadingContainer from "./LoadingContainer";
import { TMaskType } from "./MarkupEditor";
import clsx from "clsx";
import { useState } from "react";
import { useEffect } from "react";

interface IMaskImageProps {
	mainImg: TFileSchema;
	maskType: TMaskType;
}
const MaskImage = ({ mainImg, maskType }: IMaskImageProps) => {
	// To do replace tmp host with main
	return <img src={`https://agolikov.com/mask?image_id=${mainImg.id}&mask_type=${maskType}`} alt={mainImg.name}/>;
}
interface IBoxMasksProps {
	mainImg: TFileSchema;
}
const BoxMasks = ({ mainImg }:IBoxMasksProps) => {
	const [activeMask, setActiveMask] = useState<TMaskType | null>(null);
	const { t: tShared } = useTranslation(shared.__ns);
	const getToggleHandler = (maskType: TMaskType) => {
		return () => {
			setActiveMask(current => current === maskType ? null : maskType);
		}
	}
	useEffect(() => {
		const maskImages = document.querySelectorAll(
		  ".mask_img"
		) as NodeListOf<HTMLElement>;
	
		const maskContainerWidth = (
		  document.querySelector(".mask-container") as HTMLElement
		).offsetWidth;
	
		maskImages.forEach((img) => {
		  img.style.width = maskContainerWidth + "px";
		});
	
		document.getElementById("slider")!.addEventListener("input", (e) => {
			const sliderPosNumber = Number((e.target as HTMLInputElement).value);
			const sliderPos = sliderPosNumber - (1 - (0.01 * sliderPosNumber));
		  // Update the width of the foreground image
		  (
			document.querySelector(".masks") as HTMLElement
		  ).style.width = `${sliderPos}%`;
	
		  // Update the position of the slider button
		  (
			document.querySelector(".slider-button") as HTMLElement
		  ).style.left = `calc(${sliderPos}% - 15px)`;
		});
	
		// document.getElementById("slider")!.addEventListener("change", (e) => {
		//   // Additional logic to handle the 'change' event if needed
		// });
	  }, []);
	return (
		<section className="case_net __flex">
			<div className="case_images mask-container">
				<div className="case_img">
					<LoadableImage {...mainImg} />
				</div>
				<div className="masks">
					<div className={clsx("mask_img", activeMask === "veins" && "active")}>
						<MaskImage mainImg={mainImg} maskType="veins" />
					</div>
					<div className={clsx("mask_img", activeMask === "core" && "active")}>
						<MaskImage mainImg={mainImg} maskType="core" />
					</div>
					<div className={clsx("mask_img", activeMask === "destroyed" && "active")}>
						<MaskImage mainImg={mainImg} maskType="destroyed" />
					</div>
					<div className={clsx("mask_img", activeMask === "cracks" && "active")}>
						<MaskImage mainImg={mainImg} maskType="cracks" />
					</div>
					<div className={clsx("mask_img", activeMask === "litotypes" && "active")}>
						<MaskImage mainImg={mainImg} maskType="litotypes" />
					</div>
				</div>
				<input type="range" min="1" max="100" defaultValue="50" className="slider" name="slider" id="slider"/>
    			<div className="slider-button"></div>
			</div>
			<ul className="case_buttons">
				<li>
					<button onClick={getToggleHandler("veins")} className={clsx(activeMask === "veins" && "active")} data-legend={tShared(shared.vn)}>Vn</button>
				</li>
				<li>
					<button onClick={getToggleHandler("core")} className={clsx(activeMask === "core" && "active")} data-legend={tShared(shared.scr)}>SCR</button>
				</li>
				<li>
					<button onClick={getToggleHandler("destroyed")} className={clsx(activeMask === "destroyed" && "active")} data-legend={tShared(shared.broken_core)}>Des</button>
				</li>
				<li>
					<button onClick={getToggleHandler("cracks")} className={clsx(activeMask === "cracks" && "active")} data-legend={tShared(shared.cracks)}>Fr</button>
				</li>
				<li>
					<button onClick={getToggleHandler("litotypes")} className={clsx(activeMask === "litotypes" && "active")} data-legend={tShared(shared.tect)}>Tect</button>
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
const rawActionsMeta: TRawActionsMeta<TEditActionsContext & { recalculate: Function }> = [
	{
		caption: { ns: shared.__ns, key: shared.classify },
		Icon: RefreshIcon,
		onClickFactory: ({ recalculate, data }) => () => {
			recalculate([data.id]).unwrap()
				.then(() => alert("Классификация успешно инициализирована"))
				.catch((reason: object) => alert(`Ошибка при запуске классификации:\n${JSON.stringify(reason)}`));
		},
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
		show: ({ data }) => (data as TBoxSchema).status === "success",
		actions: [
			{
				caption: { ns: boxes.__ns, key: boxes.edit_interval },
				onClickFactory: ({ navigate }) => () => navigate(`edit`),
			},
			{
				caption: { ns: boxes.__ns, key: boxes.edit_markup },
				onClickFactory: ({ navigate, data }) => () => navigate(`/boxes/${(data as TBoxSchema).id}/markup`),
			},
			{
				caption: { ns: boxes.__ns, key: boxes.edit_deepnes_markup },
				onClickFactory: ({ navigate, data }) => () => navigate(`/boxes/${(data as TBoxSchema).id}/deepnes-markup`),
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
	const [recalculate] = useRecalculateMutation();
	const cellsQueryResult = useGetByBoxQuery(boxData.id);
	const boreholeQueryResult = useGetByIdQuery(boxData.borehole_id);

	const actionsContext = {
		data: boxData,
		navigate,
		tMeta,
		deleteRecords,
		recalculate
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
					boxNumber={boxData.number}
					cellId={record.id}
					cellNumber={idx + 1}
				/>)}
		</>
	);
};

export default BoxSummary;