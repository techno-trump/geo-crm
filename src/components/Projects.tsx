import { TProjectSchema, TProjectType } from '../types/projects';
import clsx from 'clsx';
import React, { useState } from 'react';
import { TTranslationKey } from '../types/shared-types';
import { useMetaTranslate } from '../hooks';
import { useGetQuery } from '../services/projects';
import LoadingContainer from './LoadingContainer';
import { useTranslation } from 'react-i18next';
import shared from '../i18n/keys/shared';
import { CategoryList } from './LastProjects';

type TGroupAlias = "all" | TProjectType;
type TGroupMeta = {
	alias: TGroupAlias;
	name: TTranslationKey;
};
type TGroupsListMeta = Array<TGroupMeta>;
const groupsMeta: TGroupsListMeta = [
	{ alias: "all", name: { ns: "shared", key: "all" } },
	{ alias: "core", name: { ns: "projects", key: "core" } },
	{ alias: "sludge", name: { ns: "projects", key: "sludge" } },
	{ alias: "outcrops", name: { ns: "projects", key: "outcrops" } },
];
type TSortBy = "name" | "date";
type TGroupedProjects = { [key in TGroupAlias]: Array<TProjectSchema> };
const groupProjects = (records: Array<TProjectSchema>) => {
	const map = groupsMeta.reduce((result, current) => {
		result[current.alias] = [];
		return result;
	}, {} as TGroupedProjects);
	records.forEach(record => {
		if (record.type in map) {
			map[record.type].push(record);
		} else {
			console.error("Unregistered project type: ", record.type);
		}
	});
	map.all = records.slice(0);
	return map;
}
const filterProjects = (records: Array<TProjectSchema>, searchQuery: string) => {
	const normalizedQuery = searchQuery.toLowerCase();
	return records.filter(record => record.name.toLowerCase().includes(normalizedQuery));
}
interface IProjectsListProps {
	searchQuery: string;
}
const ProjectsList = ({ searchQuery }: IProjectsListProps) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const [activeGroup, setActiveGroup] = useState<TGroupAlias>("all");
	const [sortBy, setSortBy] = useState<TSortBy | null>(null);
	const projectsQueryResult = useGetQuery();
	const filteredProjects = projectsQueryResult.isSuccess && filterProjects(projectsQueryResult.data, searchQuery);
	const projectsByGroup = filteredProjects && groupProjects(filteredProjects);

	if (projectsQueryResult.isLoading) {
		return <LoadingContainer />
	}
	if (projectsQueryResult.isError) {
		return (
			<div>${tShared(shared.error)}: ${JSON.stringify(projectsQueryResult.error)}</div>
		);
	}
	if (!projectsByGroup) {
		return <div>Something went wrong. No projects data to show</div>;
	}
	
	return (
		<div className="projects wrapper">
			<ProjectsList.Header
				groupsMeta={groupsMeta}
				activeGroup={activeGroup}
				setActiveGroup={setActiveGroup}
				sortBy={sortBy}
				setSortBy={setSortBy}
			/>
			<ProjectsList.Body activeGroup={activeGroup} projectsByGroup={projectsByGroup} />
		</div>
	);
}
interface IHeaderProps {
	groupsMeta: TGroupsListMeta;
	activeGroup: TGroupAlias;
	setActiveGroup: React.Dispatch<React.SetStateAction<TGroupAlias>>;
	sortBy: TSortBy | null;
	setSortBy: React.Dispatch<React.SetStateAction<TSortBy | null>>;
}
ProjectsList.Header = ({ groupsMeta, activeGroup, setActiveGroup }: IHeaderProps) => {
	const tMeta = useMetaTranslate();
	return (
		<div className="projects_top __flex-center">
			<ul className="projects_tabs">
				{
					groupsMeta.map(({ alias, name }, idx) => (
						<li key={idx} className={clsx(activeGroup === alias && "active")}>
							<button onClick={() => setActiveGroup(alias)}>{tMeta(name)}</button>
						</li>
					))
				}
			</ul>
			{/* <div className="_select">
				<Select
					options={[
						{ value: "name" as TSortBy, label: tShared(shared.by_name) },
						{ value: "date" as TSortBy, label: tShared(shared.by_last_save_date) },
					]}
					placeholder={tShared(shared.sort_by)}
					onChange={newValue => setSortBy(newValue && newValue.value)}
					required
				/>
			</div> */}
		</div>
	);
}
interface IProjectsListBodyProps {
	projectsByGroup: TGroupedProjects;
	activeGroup: TGroupAlias;
}
ProjectsList.Body = ({ activeGroup, projectsByGroup }:IProjectsListBodyProps) => {
	return (
		<div className="last_list_wrapper">
			{
				groupsMeta.map(({ alias }, idx) => {
					const groupProjects = projectsByGroup[alias];
					return <CategoryList
							key={idx}
							projects={groupProjects}
							className={clsx(activeGroup === alias && "active")
						}/>
				})
			}
		</div>
	);
}
export default ProjectsList;