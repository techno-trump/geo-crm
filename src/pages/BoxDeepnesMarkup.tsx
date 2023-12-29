import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useGetByIdQuery } from "../services/boxes";
import { useGetByIdQuery as useGetBoreholeById } from "../services/boreholes";
import { useTranslation } from "react-i18next";
import boreholes from "../i18n/keys/boreholes";
import PageHeader from "../components/PageHeader";
import boxes from "../i18n/keys/boxes";
import shared from "../i18n/keys/shared";
import { isNotEmptyString } from "../utils";
import { TBoxSchema } from "../types/boxes";
import LoadingContainer from "../components/LoadingContainer";
import { prepareActionsMeta } from "../components/Action";
import { useMetaTranslate } from "../hooks";
import { TEditActionsContext, TRawActionsMeta } from "../types/actions";
import BoxDeepnesMarkup from "../components/BoxDeepnesMarkup";
import {
  deepnessMarkupApi,
  TDeepnessDotResponse,
} from "../services/deepnesMarkup.ts";
import { useAppDispatch, useAppSelector } from "../stores/hooks.ts";
import { setFetching } from "../stores/deepnesSlice.ts";

const rawActionsMeta: TRawActionsMeta<TEditActionsContext> = [
  {
    caption: { ns: shared.__ns, key: shared.save },
    onClickFactory:
      ({ saveHandler }) =>
      () => {
        saveHandler();
      },
  },
];

const saveHandler = async (
  saveTrigger: (...args: any[]) => any,
  deleteTrigger: (...args: any[]) => any,
  refetch: (...args: any[]) => any,
  imageId: number,
  localDots: {
    id: number;
    x: number;
    y: number;
    value: string;
  }[],
  serverDots: TDeepnessDotResponse[] | undefined,
  dispatch: (...args: any[]) => any,
  isDotsFetching: boolean,
  isUpdateFetching: boolean,
  imgParam: { x: number; y: number }
) => {
  if (isDotsFetching || isUpdateFetching) {
    return;
  }
  dispatch(setFetching(true));
  if (serverDots) {
    let queryString = serverDots.reduce((acc, dot) => {
      return `${acc}depth_dots_ids=${dot.id}&`;
    }, "");
    queryString = queryString.slice(0, -1);
    await deleteTrigger(queryString);
  }

  const promiseArray = localDots.map(async (dot) => {
    return await saveTrigger({
      x_px: (dot.x * imgParam.x) / 1000,
      y_px: (dot.y / 1000) * imgParam.x,
      depth_m: Number(dot.value),
      image_id: imageId,
    });
  });
  Promise.all(promiseArray).then(() => {
    console.log("refetch");
    dispatch(setFetching(false));
    refetch();
  });
};

interface IPageHeaderContainerProps {
  boxData: TBoxSchema;
}
const PageHeaderContainer = ({ boxData }: IPageHeaderContainerProps) => {
  const navigate = useNavigate();
  const { t: tShared } = useTranslation(shared.__ns);
  const { t: tBoreholes } = useTranslation(boreholes.__ns);
  const { t: tBoxes } = useTranslation(boxes.__ns);
  const tMeta = useMetaTranslate();
  const markerCoords = useAppSelector((state) => state.deepness.markers);
  const imgParam = useAppSelector((state) => state.deepness.imgParam);
  const {
    data: dotsData,
    isFetching: isDotsFetching,
    refetch: refetchDots,
  } = deepnessMarkupApi.useGetDotsQuery(Number(boxData.image.id));
  const dispatch = useAppDispatch();
  const isUpdateFetching = useAppSelector((state) => state.deepness.isFetching);

  const {
    data: boreholeData,
    isError,
    error,
    isLoading,
  } = useGetBoreholeById(boxData.borehole_id);

  const [saveTrigger] = deepnessMarkupApi.useCreateDotMutation();
  const [deleteTrigger] = deepnessMarkupApi.useDeleteDotMutation();

  if (isLoading) {
    return <LoadingContainer />;
  }
  if (isError) {
    return (
      <div>
        ${tShared(shared.error)}: ${JSON.stringify(error)}
      </div>
    );
  }

  const actionsContext = {
    id: boxData.id,
    data: boxData,
    navigate,
    tMeta,
    deleteRecords: () => {},
    addRecord: () => {},
    saveHandler: () => {
      saveHandler(
        saveTrigger,
        deleteTrigger,
        refetchDots,
        boxData.image.id,
        markerCoords,
        dotsData,
        dispatch,
        isDotsFetching,
        isUpdateFetching,
        imgParam
      );
    },
  };
  const actionsMeta = prepareActionsMeta(rawActionsMeta, actionsContext);

  return (
    <PageHeader
      title={[
        {
          caption: tBoreholes(boreholes.borehole),
          value: boreholeData?.name || "",
        },
        {
          caption: tBoreholes(boreholes.depth),
          value: String(boreholeData?.depth) + " м",
        },
        {
          caption: tBoxes(boxes.interval),
          value: `${String(boxData.interval_from)}-${String(
            boxData.interval_to
          )}`,
        },
      ]}
      actions={actionsMeta}
    />
  );
};

interface IBoxSummaryPageProps {
  boxId: number;
}
const BoxDeepnesMarkupPage = ({ boxId }: IBoxSummaryPageProps) => {
  const { t: tShared } = useTranslation(shared.__ns);
  const { data: boxData, isError, isLoading, error } = useGetByIdQuery(boxId);
  if (isLoading) {
    return <LoadingContainer />;
  }
  if (isError) {
    return (
      <div>
        ${tShared(shared.error)}: ${JSON.stringify(error)}
      </div>
    );
  }
  if (!boxData) {
    return <div>Box data is unavailable</div>;
  }
  return (
    <>
      <PageHeaderContainer boxData={boxData} />
      <div className="case wrapper">
        <BoxDeepnesMarkup boxData={boxData} />
      </div>
      <Outlet />
    </>
  );
};

const Container = () => {
  const { boxId: boxIdStr } = useParams();
  if (isNotEmptyString(boxIdStr) && boxIdStr.match(/\d+/)) {
    return <BoxDeepnesMarkupPage boxId={Number(boxIdStr)} />;
  }
  return <div>Box id was not provided or invalid; Box ID: {boxIdStr}</div>;
};

export default Container;
