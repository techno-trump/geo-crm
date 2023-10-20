import { Outlet } from 'react-router-dom';
import Aside from './Aside';

export interface ILayoutProps {
}
const Layout = () => {
	return (
		<div className="net">
			<Aside/>
			<main className='relative'>
				<Outlet/>
			</main>
		</div>
	);
}
export default Layout;