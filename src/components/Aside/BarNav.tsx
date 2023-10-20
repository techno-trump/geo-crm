import * as React from 'react';
import { Link } from "react-router-dom";

export interface INavItemProps {
	to: string;
	Icon: React.FC;
	name: string;
}
const NavItem: React.FC<INavItemProps> = ({ to, Icon, name }) => {
	return (
		<Link to={to} data-legend={name}>
			<Icon />
			<span>{name}</span>
		</Link>
	);
}
export interface INavBlockProps {
	itemsMeta: Array<INavItemProps>
}
const NavBlock: React.FC<INavBlockProps> = ({ itemsMeta }) => {
	return (
		<nav className="bar_nav">
			<ul>
				{itemsMeta.map(meta => (<li key={meta.name}><NavItem {...meta}/></li>))}
			</ul>
		</nav>
	);
};

export default NavBlock;
