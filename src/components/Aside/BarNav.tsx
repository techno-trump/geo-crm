import * as React from 'react';
import { Link } from "react-router-dom";
import { TTranslationKey } from '../../types/shared-types';
import { useMetaTranslate } from '../../hooks';

export interface INavItemProps {
	to: string;
	Icon: React.FC;
	name: TTranslationKey;
}
const NavItem: React.FC<INavItemProps> = ({ to, Icon, name }) => {
	const tMeta = useMetaTranslate();
	return (
		<Link to={to} data-legend={name}>
			<Icon />
			<span>{tMeta(name)}</span>
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
				{itemsMeta.map((meta, idx) => (<li key={idx}><NavItem {...meta}/></li>))}
			</ul>
		</nav>
	);
};

export default NavBlock;
