import { Outlet, useNavigate, useParams } from "react-router-dom";
import { isNotEmptyString } from "../utils";
import PageHeader from "../components/PageHeader";
import boreholes from "../i18n/keys/boreholes";
import shared from "../i18n/keys/shared";
import { useTranslation } from "react-i18next";
import { useMetaTranslate } from "../hooks";
import { TRawActionsMeta, TReportActionsContext } from "../types/actions";
import { prepareActionsMeta } from "../components/Action";
import { useGetByIdQuery } from "../services/boxes";
import { useGetByIdQuery as useGetBoreholeByIdQuery } from "../services/boreholes";
import { skipToken } from "@reduxjs/toolkit/query";
import LoadingContainer from "../components/LoadingContainer";
import boxes from "../i18n/keys/boxes";
import Histogram from "../components/Histogram";

const rawActionsMeta: TRawActionsMeta<TReportActionsContext> = [
	{
		caption: { ns: shared.__ns, key: shared.save_columns },
		onClickFactory: (_) => () => {},
	},
	{
		caption: { ns: shared.__ns, key: shared.save_csv },
		onClickFactory: (_) => () => {},
	},
];

interface IGeologicalColumnPageProps {
	boxId: number;
}
const HistogramPage = ({ boxId }: IGeologicalColumnPageProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { t: tBoxes } = useTranslation(boxes.__ns);
	const navigate = useNavigate();
	const tMeta = useMetaTranslate();
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const boxQueryResult = useGetByIdQuery(boxId);
	const boreholeQueryResult = useGetBoreholeByIdQuery(boxQueryResult.data && boxQueryResult.data.borehole_id || skipToken);

	const actionsContext = {
		data: {},
		navigate,
		tMeta
	}

	const actionsMeta = prepareActionsMeta(rawActionsMeta, actionsContext);

	if (boxQueryResult.isLoading || boreholeQueryResult.isLoading) {
		return <LoadingContainer />
	}
	if (boxQueryResult.isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(boxQueryResult.error)}</div>;
	}
	if (boreholeQueryResult.isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(boreholeQueryResult.error)}</div>;
	}
	if (!boxQueryResult.data) {
		return <div>Something went wrong. No box data to show</div>;
	}
	if (!boreholeQueryResult.data) {
		return <div>Something went wrong. No borehole data to show</div>;
	}

	return (
		<>
			<PageHeader title={[
					{ caption: tBoreholes(boreholes.borehole), value: boreholeQueryResult.data.name || "" },
					{ caption: tBoreholes(boreholes.depth), value: String(boreholeQueryResult.data.depth) + " м" },
					{ caption: tBoxes(boxes.interval), value: `${String(boxQueryResult.data.interval_from)}-${String(boxQueryResult.data.interval_to)}` }
				]} actions={actionsMeta}/>
			<div className="histogram wrapper">
				<Histogram boxData={boxQueryResult.data} boreholeData={boreholeQueryResult.data} />
			</div>
			<Outlet />
		</>
	);
}

const Container = () => {
	const { boxId: boxIdStr } = useParams();
	
	if (isNotEmptyString(boxIdStr) && boxIdStr.match(/\d+/)) {
		return <HistogramPage boxId={Number(boxIdStr)} />;
	}
	return <div>Box id was not provided or invalid; Box ID: {boxIdStr}</div>;
} 
export default Container;