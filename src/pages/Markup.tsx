import { useParams } from "react-router-dom";
import { isNotEmptyString } from "../utils";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";
import shared from "../i18n/keys/shared";
import boreholes from "../i18n/keys/boreholes";
import boxes from "../i18n/keys/boxes";
import { useGetByIdQuery } from "../services/boxes";
import { useGetByIdQuery as useGetBoreholeByIdQuery } from "../services/boreholes";
import LoadingContainer from "../components/LoadingContainer";
import { skipToken } from "@reduxjs/toolkit/query";
import MarkupEditor from "../components/MarkupEditor";

interface IMarkupPageProps {
	boxId: number;
}

const MarkupPage = ({ boxId }: IMarkupPageProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { t: tBoxes } = useTranslation(boxes.__ns);
	
	const boxQueryResult = useGetByIdQuery(boxId);
	const { data: boxData } = boxQueryResult;
	const boreholeQueryParam = boxQueryResult.isSuccess && boxData && boxData.borehole_id || skipToken;
	const boreholeQueryResult = useGetBoreholeByIdQuery(boreholeQueryParam);
	const { data: boreholeData } = boreholeQueryResult;
	if (boxQueryResult.isLoading || boreholeQueryResult.isLoading) {
		return <LoadingContainer />
	}
	if (boxQueryResult.isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(boxQueryResult.error)}</div>;
	}
	if (boreholeQueryResult.isError) {
		return <div>${tShared(shared.error)}: ${JSON.stringify(boreholeQueryResult.error)}</div>;
	}
	if (!boxData) {
		return <div>Box data is unavailable</div>;
	}
	if (!boreholeData) {
		return <div>Borehole data is unavailable</div>;
	}
	
	return (
		<>
			<section className="top  __flex-center">
				<PageHeader title={[
					{ caption: tBoreholes(boreholes.borehole), value: boreholeData.name || "" },
					{ caption: tBoreholes(boreholes.depth), value: String(boreholeData.depth) + " м" },
					{ caption: tBoxes(boxes.interval), value: `${String(boxData.interval_from)}-${String(boxData.interval_to)}` }
				]} />
			</section>
			<MarkupEditor boxData={boxData} />
		</>
	);
};

const Container = () => {
	const { boxId: boxIdStr } = useParams();
	if (isNotEmptyString(boxIdStr) && boxIdStr.match(/\d+/)) {
		return <MarkupPage boxId={Number(boxIdStr)} />;
	}
	return <div>Box id was not provided or invalid; Box ID: {boxIdStr}</div>;
};

export default Container;
