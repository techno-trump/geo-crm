import { Outlet, useParams } from "react-router-dom";
import { useGetByIdQuery } from "../services/boxes";
import { useGetByIdQuery as useGetBoreholeById } from "../services/boreholes";
import { useTranslation } from 'react-i18next';
import boreholes from "../i18n/keys/boreholes";
import PageHeader from "../components/PageHeader";
import boxes from "../i18n/keys/boxes";
import BoxSummary from "../components/BoxSummary";
import shared from "../i18n/keys/shared";
import { isNotEmptyString } from "../utils";
import { TBoxSchema } from "../types/boxes";
import LoadingContainer from "../components/LoadingContainer";

interface IPageHeaderContainerProps {
	boxData: TBoxSchema;
}
const PageHeaderContainer = ({ boxData }:IPageHeaderContainerProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { t: tBoxes } = useTranslation(boxes.__ns);
	const { data: boreholeData, isError, error, isLoading } = useGetBoreholeById(boxData.borehole_id);

	if (isLoading) {
		return <LoadingContainer />
	}
	if (isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(error)}</div>;
	}

	return (
		<PageHeader title={[
			{ caption: tBoreholes(boreholes.borehole), value: boreholeData?.name || "" },
			{ caption: tBoreholes(boreholes.depth), value: String(boreholeData?.depth) + " м" },
			{ caption: tBoxes(boxes.interval), value: `${String(boxData.interval_from)}-${String(boxData.interval_to)}` }
		]} />
	);
} 

interface IBoxSummaryPageProps {
	boxId: number;
}
const BoxSummaryPage = ({ boxId }: IBoxSummaryPageProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { data: boxData, isError, isLoading, error } = useGetByIdQuery(boxId);
	
	if (isLoading) {
		return <LoadingContainer />
	}
	if (isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(error)}</div>;
	}
	if (!boxData) {
		return <div>Box data is unavailable</div>
	}
	return (
		<>
			<PageHeaderContainer boxData={boxData} />
			<div className="well wrapper">
				<BoxSummary boxData={boxData} />
			</div>
			<Outlet />
		</>
	);
};

const Container = () => {
	const { boxId: boxIdStr } = useParams();
	if (isNotEmptyString(boxIdStr) && boxIdStr.match(/\d+/)) {
		return <BoxSummaryPage boxId={Number(boxIdStr)} />;
	}
	return <div>Box id was not provided or invalid; Box ID: {boxIdStr}</div>;
};

export default Container;