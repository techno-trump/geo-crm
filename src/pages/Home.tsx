import { Link, useNavigate } from 'react-router-dom';
import { projectType } from '../constants';
import LastProjects from "../components/LastProjects";
import projects from '../i18n/keys/projects';
import { useTranslation } from 'react-i18next';

const Home = () => {
	const { t: tProjects } = useTranslation(projects.__ns);
	const navigate = useNavigate();
	
	return (
		<>
			<section className="new">
				<div className="new_title">{tProjects(projects.new_project)}</div>
				<ul className="new_list">
					<li>
						<Link to={"./projects/new"} state={{ type: projectType.CORE }}>
							<picture>
								<source srcSet="/images/svg/p1.svg" type="image/webp"/>
								<img src="/images/svg/p1.svg" alt=""/>
							</picture>
							<p>{tProjects(projects[projectType.CORE])}</p>
						</Link>
					</li>
					<li>
						<Link to={"./projects/new"} state={{ type: projectType.SLUDGE }}>
							<picture>
								<source srcSet="/images/svg/p2.svg" type="image/webp"/>
								<img src="/images/svg/p2.svg" alt=""/>
							</picture>
							<p>{tProjects(projects[projectType.SLUDGE])}</p>
						</Link>
					</li>
					<li>
						<Link to={"./projects/new"} state={{ type: projectType.OUTCROPS }}>
							<picture>
								<source srcSet="/images/svg/p3.svg" type="image/webp"/>
								<img src="/images/svg/p3.svg" alt=""/>
							</picture>
							<p>{tProjects(projects[projectType.OUTCROPS])}</p>
						</Link>
					</li>
				</ul>
				<hr/>
				<div className="new_load">
					<label onClick={() => navigate("/projects/new")}>
						<input className="__input_hidden" disabled type="file"/>
						<span>
							<picture>
								<source srcSet="/images/svg/load.svg" type="image/webp"/>
								<img src="/images/svg/load.svg" alt=""/>
							</picture>
							{tProjects(projects.load_project)}
						</span>
					</label>
				</div>
			</section>
			<LastProjects />
		</>
	);
};

export default Home;
