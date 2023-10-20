import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../stores/hooks';
import { selectIsAuthorized } from '../stores/userSlice';

interface IPrivateRouteProps {
	children: React.ReactNode
}

const PrivateRoute: React.FunctionComponent<IPrivateRouteProps> = ({ children }) => {
	const isAuthorised = useAppSelector(selectIsAuthorized);
	return isAuthorised ? <>{children}</> : <Navigate to="/auth"/>;
};

export default PrivateRoute;
