import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import Layout from './components/Layout';
import './assets/css/main.min.css';
import './assets/css/adds.scss';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Authorization from './pages/Authorization';
import PrivateRoute from './components/PrivateRoute';
import './i18n';
import PresetsLoader from './components/PresetsLoader';
import NewPoject from "./pages/NewProject";
import NewBorehole from './pages/NewBorehole';
import EditBorehole from './pages/EditBorehole';
import BoreholeForm from './components/BoreholeForm';
import LoadingSplash from './components/LoadingSplash';
import BoxForm from './components/BoxForm';
import BoxSummaryPage from './pages/BoxSummary';
import GeologicalColumnPage from './pages/GeologicalColumn';
import HistogramPage from './pages/Histogram';
import ManualPage from "./pages/Manual";
import MarkupPage from "./pages/Markup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute><Layout /></PrivateRoute>,
		children: [
      {
        path: "",
        element: <Home />,
      },
			{
        path: "settings",
        element: <Settings />,
      },
			{
				path: "manual",
				element: <ManualPage />,
			},
			{
        path: "projects/new",
        element: <NewPoject />,
      },
			{
        path: "boreholes/new",
        element: <NewBorehole />,
      },
			{
        path: "boreholes/:boreholeId",
        element: <EditBorehole />,
				children: [
					{
						path: "edit",
       			element: <BoreholeForm />,
					},
					{
						path: "box/:boxId/edit",
       			element: <BoxForm />,
					},
				]
      },
			{
				path: "boreholes/:boreholeId/column",
					element: <GeologicalColumnPage />,
			},
			{
        path: "boxes/:boxId",
        element: <BoxSummaryPage />,
				children: [
					{
						path: "edit",
       			element: <BoxForm />,
					}
				]
      },
			{
				path: "boxes/:boxId/markup",
				 element: <MarkupPage />,
			},
			{
				path: "boxes/:boxId/histogram",
				element: <HistogramPage />,
				children: [
					{
						path: "edit",
       			element: <BoxForm />,
					}
				]
			}
    ],
  },
	{
		path: "auth",
		element: <Authorization />,
	}
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
		<Provider store={store}>
			<PresetsLoader />
			<Suspense fallback={<LoadingSplash />}>
    		<RouterProvider router={router} />
			</Suspense>
		</Provider>
  </React.StrictMode>,
)