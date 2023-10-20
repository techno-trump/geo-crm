import { useTranslation } from "react-i18next";
import { useGetByBoreholeQuery } from "../services/boxes";
import { useGetByBoxQuery } from "../services/cells";
import shared from "../i18n/keys/shared";
import LoadingContainer from "./LoadingContainer";
import { TBoxSchema } from "../types/boxes";
import { toFixed } from "../utils";
import { useGetByIdQuery } from "../services/boreholes";
import { TBoreholeSchema } from "../types/boreholes";
import { api } from "../config";

interface IColumnDataByBoxProps {
	boxData: TBoxSchema;
	boreholeData: TBoreholeSchema;
}
const ColumnDataByBox = ({ boxData, boreholeData }:IColumnDataByBoxProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { data, isError, error, isLoading } = useGetByBoxQuery(boxData.id);

	if (isLoading) {
		return <tr><td><LoadingContainer /></td></tr>
	}
	if (isError) {
		return <tr><td>${tShared(shared.error)}: ${JSON.stringify(error)}</td></tr>;
	}
	if (!data) {
		return <tr><td>Something went wrong. No intervals data to show</td></tr>;
	}

	return (
		<>
			{
				data.map(({ intervals }, cellIdx) => 
				intervals.map((record, intervalIdx) => (
					<tr key={`${cellIdx}${intervalIdx}`}>
						<td>{boreholeData.name}</td>
						<td>{toFixed(record.interval_from, 2)}</td>
						<td>{toFixed(record.interval_to, 2)}</td>
						<td>{toFixed(record.solid_core, 2)}</td>
						<td>{toFixed(record.broken_core, 2)}</td>
						<td>{toFixed(record.vien_quantity, 2)}</td>
						<td>{toFixed(record.vien, 2)}</td>
						<td>{toFixed(record.breccia, 2)}</td>
						<td>{toFixed(record.cataclosite, 2)}</td>
						<td>{toFixed(record.mylonite, 2)}</td>
						<td>
							<a href={`${api.url}images/${boxData.image.id}`}
								target="_blank"
								data-legend={boxData.image.name}>
								<span>{boxData.image.name}</span>
							</a>
						</td>
						<td>
								<textarea></textarea>
						</td>
					</tr>
				)))
			}
		</>
	);
}

interface IGeologicalColumnProps {
	boreholeId: number;
}
const GeologicalColumn = ({ boreholeId }: IGeologicalColumnProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const boreholeQueryResult = useGetByIdQuery(boreholeId);
	const boxesQueryResult = useGetByBoreholeQuery(boreholeId);

	if (boreholeQueryResult.isLoading || boxesQueryResult.isLoading) {
		return <LoadingContainer />
	}
	if (boreholeQueryResult.isError || boxesQueryResult.isError) {
		return (
			<>
				{boreholeQueryResult.isError &&
					<div>${tShared(shared.error)}: ${JSON.stringify(boreholeQueryResult.error)}</div>
				}
				{boxesQueryResult.isError &&
					<div>${tShared(shared.error)}: ${JSON.stringify(boxesQueryResult.error)}</div>
				}
			</>
		);
	}
	if (!boreholeQueryResult.data) {
		return <div>Something went wrong. No borehole data to show</div>;
	}
	if (!boxesQueryResult.data) {
		return <div>Something went wrong. No boxes data to show</div>;
	}

	return (
		<div className="column wrapper">
			<table>
				<thead>
					<tr>
						<th>DHID</th>
						<th>From_m</th>
						<th>To_m</th>
						<th>SolidCore_perc</th>
						<th>BrokenCore_perc</th>
						<th>Fractures_qnt</th>
						<th>Veins_perc</th>
						<th>Breccia_perc</th>
						<th>Cataclasite_perc</th>
						<th>Milonite_perc</th>
						<th>Image_Name</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{
						boxesQueryResult.data.map((record, idx) =>
							<ColumnDataByBox key={idx} boxData={record} boreholeData={boreholeQueryResult.data} />)
					}
				</tbody>
			</table>
		</div>
	);
}

export default GeologicalColumn;