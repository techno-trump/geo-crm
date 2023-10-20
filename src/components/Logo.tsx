import * as React from 'react';
import { Link } from 'react-router-dom';

interface ILogoProps {
}

const Logo: React.FunctionComponent<ILogoProps> = () => {
	return (
		<Link className="bar_logo" to=".">
			<picture>
				<source srcSet="/images/svg/logo.svg" type="image/webp"/>
				<img src="/images/svg/logo.svg" alt=""/>
			</picture>
		</Link>
	);
};

export default Logo;
