import projects from '../i18n/keys/projects';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import { useState } from 'react';
import Projects from '../components/Projects';

const ProjectsPage = () => {
	const { t: tProjects } = useTranslation(projects.__ns);
	const [searchQuery, setSearchQuery] = useState<string>("");
	
	return (
		<>
			<PageHeader title={tProjects(projects.all_projects)} setSearchQuery={setSearchQuery}/>
			<Projects searchQuery={searchQuery} />
		</>
	);
};

export default ProjectsPage;
