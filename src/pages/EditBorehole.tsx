import { prepareActionsMeta } from "../components/Action";
import PageHeader from "../components/PageHeader";
import { useTranslation } from 'react-i18next';
import boreholes from "../i18n/keys/boreholes";
import shared from "../i18n/keys/shared";
import BoreholeBoxesGridView from "../components/BoreholeBoxesGridView";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useGetByIdQuery } from "../services/boreholes";
import { TBoreholeSchema } from "../types/boreholes";
import { isNotEmptyString } from "../utils";
import { useMetaTranslate } from "../hooks";
import { TEditActionsContext, TRawActionMeta } from "../types/actions";

const rawActionsMeta: Array<TRawActionMeta<TEditActionsContext>> = [
	{
		caption: { ns: shared.__ns, key: shared.change_attributes },
		onClickFactory: ({ data, navigate }) => () => navigate("./edit", { state: data as TBoreholeSchema, replace: true }),
	},
	{
		caption: { ns: shared.__ns, key: shared.save_columns },
		onClickFactory: (_) => () => {},
	},
	{
		caption: { ns: shared.__ns, key: shared.save_csv },
		onClickFactory: (_) => () => {},
	}
];

interface IEditBoreholeProps {
	boreholeId: number;
}
export const EditBorehole = ({ boreholeId }:IEditBoreholeProps) => {
	const navigate = useNavigate();
	const tMeta = useMetaTranslate();
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { data } = useGetByIdQuery(boreholeId);
	const actionsMeta = data && prepareActionsMeta(rawActionsMeta, { data, navigate, tMeta, deleteRecords: () => {} });
	
	return (
		<>
			<PageHeader title={[
				{ caption: tBoreholes(boreholes.borehole), value: data?.name || "" },
				{ caption: tBoreholes(boreholes.depth), value: String(data?.depth) + " м" }
			]} actions={actionsMeta}/>
			<div className="well wrapper">
				{<BoreholeBoxesGridView boreholeId={Number(boreholeId)} />}
			</div>
			<Outlet />
		</>
	);
}

const Container = () => {
	const { boreholeId: boreholeIdStr } = useParams();
	if (isNotEmptyString(boreholeIdStr) && boreholeIdStr.match(/\d+/)) {
		return <EditBorehole boreholeId={Number(boreholeIdStr)} />;
	}
	return <div>Borehole id was not provided or invalid; Borehole ID: {boreholeIdStr}</div>;
};

export default Container;
