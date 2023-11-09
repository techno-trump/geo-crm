import { Link, useNavigate } from 'react-router-dom';
import Disclosure, { DisclosureContext } from '../components/Disclosure';
import { useContext, useMemo, useState } from 'react';
import projectsKeys from '../i18n/keys/projects';
import { useTranslation } from 'react-i18next';
import shared from '../i18n/keys/shared';
import { useAppSelector } from '../stores/hooks';
import { selectUserProjects } from '../stores/userSlice';
import { useGetByProjectQuery } from '../services/boreholes';
import { projectTypes } from '../constants';
import { TProjectSchema, TProjectType } from '../types/projects';
import clsx from 'clsx';
import { SmallArrowDownIcon } from './icons';
import React from 'react';
import LoadingContainer from './LoadingContainer';
import { TBoreholeSchema } from '../types/boreholes';
import boreholes from '../i18n/keys/boreholes';

interface IHeaderProps {
	search: string;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
}
const Header = ({ search, setSearch }: IHeaderProps) => {
	const { t: tProjects } = useTranslation(projectsKeys.__ns);
	const { t: tShared } = useTranslation(shared.__ns);

	return (
		<div className="last_top __flex-center">
			<div className="last_title">{tProjects(projectsKeys.latest_projects)}</div>
			<div className="last_search">
				<div className="search">
					<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tShared(shared.search_by_name)}/>
					<button>
						<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fillRule="evenodd" clipRule="evenodd" d="M8 4.5C8 6.433 6.433 8 4.5 8C2.567 8 1 6.433 1 4.5C1 2.567 2.567 1 4.5 1C6.433 1 8 2.567 8 4.5ZM7.30884 8.0159C6.53901 8.6318 5.56251 9 4.5 9C2.01472 9 0 6.98528 0 4.5C0 2.01472 2.01472 0 4.5 0C6.98528 0 9 2.01472 9 4.5C9 5.56251 8.6318 6.53901 8.0159 7.30884L10.8536 10.1464C11.0488 10.3417 11.0488 10.6583 10.8536 10.8536C10.6583 11.0488 10.3417 11.0488 10.1464 10.8536L7.30884 8.0159Z" fill="var(--color)"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
interface ICategoryListProps {
	projects: Array<TProjectSchema>;
	className?: string;
}
export const CategoryList = ({ projects, className }: ICategoryListProps) => {

	return (
		<ul className={clsx("last_list", className)}>
			{projects.map((projectData) =>
				<li key={projectData.id}>
					<CategoryList.Item {...projectData} />
				</li>
			)}
		</ul>
	);
}
interface IProjectBoreholeProps {
	record: TBoreholeSchema;
}
CategoryList.Borehole = ({ record }: IProjectBoreholeProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	return (
		<li>
			<p>{record.name}; {tBoreholes(boreholes.depth)}: {record.depth} {tShared(shared.unit_meter)}</p>
			<Link className="__btn"
				to={`/boreholes/${record.id}`}
				state={{ projectId: record.project_id }}>{tShared(shared.open)}</Link>
		</li>
	)
}
interface ICategoryItemProps extends TProjectSchema { 
};
interface IItemHeaderProps {
	name: string;
	projectId: number;
}
const ItemHeader = ({ name, projectId }:IItemHeaderProps) => {
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { toggle, isOpen } = useContext(DisclosureContext);
	const navigate = useNavigate();

	return (
		<Disclosure.Header className="last-project-row__header" openClassName="active" asController={false}>
			{/* <Picture {...img} /> */}
			<span>{name}</span>
			<div className="last-project-row__actions">
				<button type="button" className="__btn" onClick={() => navigate("/boreholes/new", { state: { projectId } })}>
					{tBoreholes(boreholes.add_borehole)}
				</button>
				<div className="vertical-separator"></div>
				<button type="button"
					className={clsx("__btn btn_no-grid-gap last-project-row__toggle", isOpen && "last-project-row__toggle_active")}
					onClick={toggle}>
					<SmallArrowDownIcon />
					{"toggle"}
				</button>
			</div>
		</Disclosure.Header>
	);
}
CategoryList.Item = ({ name, id }: ICategoryItemProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const { data, isLoading, isError, error } = useGetByProjectQuery(id);

	const renderBody = () => {
		if (isLoading) return <LoadingContainer />;
		if (isError) return <div>${tShared(shared.error)}: ${JSON.stringify(error)}</div>;
		if (!data) return <div>Something went wrong. No boreholes data to show</div>;
		return data.map((record) =>
				<CategoryList.Borehole
					key={record.id}
					record={record}
				/>
			);
	};

	return (
		<Disclosure>
			<ItemHeader name={name} projectId={id} />
			<Disclosure.Body>
				<ul>
					{renderBody()}
				</ul>
			</Disclosure.Body>
		</Disclosure>
	);
}
interface ICategoryProps {
	title: string;
	projects: Array<TProjectSchema>;
}
const Category = ({ title, projects }:ICategoryProps) => {
	const { t: tProject } = useTranslation(projectsKeys.__ns);

	return (
		<div>
			<div className="last_subtitle">{tProject(title)}</div>
			<CategoryList projects={projects} />
		</div>
	);
} 
type TGroupedProjects = {
	[key in TProjectType]: Array<TProjectSchema>;
};

const LastProjects = () => {
	const [search, setSearch] = useState<string>("");
	const normalSearch = useMemo(() => search.toLowerCase(), [search]);
	const userProjects = useAppSelector(selectUserProjects);
	const filteredUserProjects = useMemo(() => {
		return userProjects.filter(projectData => projectData.name.toLowerCase().includes(normalSearch))
	}, [userProjects, search]);
	
	const groupedUserProjects = useMemo(() => {
		const groups = projectTypes.reduce((acc, current) => {
			acc[current.alias] = []; return acc;
		}, {} as TGroupedProjects);
		filteredUserProjects.forEach(projectData => {
			if (projectData.type in groups) {
				groups[projectData.type].push(projectData);
			}
		})
		return groups;
	}, [filteredUserProjects]);

	return (
		<section className="last">
			<Header search={search} setSearch={setSearch} />
			{Object.keys(groupedUserProjects).map((type) =>
				<Category
					key={type}
					title={type}
					projects={groupedUserProjects[type as TProjectType]}
				/>
			)}
		</section>
	);
}
export default LastProjects;