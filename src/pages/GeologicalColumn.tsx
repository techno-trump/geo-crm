import { useNavigate, useParams } from "react-router-dom";
import { isNotEmptyString } from "../utils";
import PageHeader from "../components/PageHeader";
import boreholes from "../i18n/keys/boreholes";
import shared from "../i18n/keys/shared";
import { useTranslation } from "react-i18next";
import { useMetaTranslate } from "../hooks";
import { TRawActionsMeta, TReportActionsContext } from "../types/actions";
import { prepareActionsMeta } from "../components/Action";
import GeologicalColumn from "../components/GeologicalColumn";

const rawActionsMeta: TRawActionsMeta<TReportActionsContext> = [
	{
		caption: { ns: shared.__ns, key: shared.save },
		onClickFactory: (_) => () => {},
	},
];

interface IGeologicalColumnPageProps {
	boreholeId: number;
}
const GeologicalColumnPage = ({ boreholeId }: IGeologicalColumnPageProps) => {
	const navigate = useNavigate();
	const tMeta = useMetaTranslate();
	const { t: tBoreholes } = useTranslation(boreholes.__ns);

	const actionsContext = {
		data: {},
		navigate,
		tMeta
	}

	const actionsMeta = prepareActionsMeta(rawActionsMeta, actionsContext);
	
	return (
		<>
			<PageHeader title={tBoreholes(boreholes.geologocal_column)} actions={actionsMeta}/>
			<div className="well wrapper">
				<GeologicalColumn boreholeId={boreholeId} />
			</div>
		</>
	);
}

const Container = () => {
	const { boreholeId: boreholeIdStr } = useParams();
	
	if (isNotEmptyString(boreholeIdStr) && boreholeIdStr.match(/\d+/)) {
		return <GeologicalColumnPage boreholeId={Number(boreholeIdStr)} />;
	}
	return <div>Borehole id was not provided or invalid; Borehole ID: {boreholeIdStr}</div>;
} 
export default Container;