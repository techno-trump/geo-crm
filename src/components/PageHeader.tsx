import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "./icons";
import { TActionsMeta } from "../types/actions";
import { renderActions } from "./Action";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import shared from "../i18n/keys/shared";
import { MagnifierIcon } from "./icons";



type TAttrList = Array<{ caption: string; value: string; }>;
interface IPageHeaderProps {
	title: string | TAttrList;
	actions?: TActionsMeta;
	setSearchQuery?: Dispatch<SetStateAction<string>>;
}
const PageHeader = ({ title, actions, setSearchQuery }: IPageHeaderProps) => {
	const navigate = useNavigate();
	const { t: tShared } = useTranslation(shared.__ns);
	const renderTitleFromAttributes = (title: TAttrList) => {
		return (
			<div className="top_name">
				<ul>
					{title.map(({ caption, value }, idx) => (
						<li key={idx}>
							<span>{caption}</span>
							{value}
						</li>
						))}
				</ul>
			</div>
		);
	}
	return (
		<section className="top  __flex-center">
			<div className="top_left __flex-align">
				<button type="button" onClick={() => navigate(-1)} className="top_back">
					{<ArrowLeftIcon />}
				</button>
				
				{
					typeof title === "object" ?
					renderTitleFromAttributes(title) :
					<div className="top_name">{title}</div>
				}
			</div>
			{ 
				actions &&
				<div className="top_right __flex-align">
					{renderActions(actions)}
				</div>
			}
			{
				setSearchQuery &&
				<div className="search">
					<input type="text" onChange={({ target }) => setSearchQuery(target.value)} placeholder={tShared(shared.search_by_name)} />
					<button>
						<MagnifierIcon />
					</button>
				</div>
			}
		</section>
	);
} 
export default PageHeader;
