import { useNavigate } from "react-router-dom";
import boxes from "../i18n/keys/boxes";
import shared from "../i18n/keys/shared";
import { TEditActionsContext, TRawActionsMeta } from "../types/actions";
import { TBoxSchema } from "../types/boxes";
import { AddIcon, RemoveIcon } from "./icons";
import { useMetaTranslate } from "../hooks";
import { prepareActionsMeta } from "./Action";
import ActionsPanel from "./ActionsPanel";
import { useEffect, useState } from "react";
import { NumberInput } from "./NumberInput.tsx";
import { CanvasImage } from "./CanvasImage.tsx";
import { deepnessMarkupApi } from "../services/deepnesMarkup.ts";

const rawActionsMeta: TRawActionsMeta<TEditActionsContext> = [
  {
    tooltip: { ns: shared.__ns, key: shared.add },
    Icon: AddIcon,
    onClickFactory:
      ({ addRecord }) =>
      () => {
        addRecord();
      },
  },
  {
    tooltip: { ns: shared.__ns, key: shared.remove },
    Icon: RemoveIcon,
    onClickFactory:
      ({ data, deleteRecords, tMeta }) =>
      () => {
        if (confirm(tMeta({ ns: "shared", key: "confirm_records_removal" }))) {
          deleteRecords(data.id);
        }
      },
  },
];

export type MarkerValue = { id: number; value: string };

interface IBoxDeepnesMarkupProps {
  boxData: TBoxSchema;
}
const BoxDeepnesMarkup = ({ boxData }: IBoxDeepnesMarkupProps) => {
  const navigate = useNavigate();
  const tMeta = useMetaTranslate();
  const [markers, setMarkers] = useState<MarkerValue[]>([]);
  const actionsContext = {
    data: boxData,
    navigate,
    tMeta,
    deleteRecords: () => {
      setMarkers([]);
    },
    addRecord: () => {
      setMarkers((prev) => [
        ...prev,
        { id: prev[prev.length - 1]?.id + 1 || 0, value: "0" },
      ]);
    },
    saveHandler: () => {},
  };
  const actionsMeta = prepareActionsMeta(rawActionsMeta, actionsContext);

  const { data: dotsData } = deepnessMarkupApi.useGetDotsQuery(
    boxData.image.id
  );

  useEffect(() => {
    if (dotsData) {
      setMarkers(
        dotsData.map((dot) => ({ id: dot.id, value: String(dot.depth_m) }))
      );
    }
  }, [dotsData]);

  return (
    <section className="case_net __flex">
      <div className="case_img">
        <CanvasImage image={boxData.image.id} markers={markers} />
      </div>
      <div className="case_left">
        <ActionsPanel className="buttons __flex-start" meta={actionsMeta} />
        <ul className="case_lines">
          {markers.map((marker) => (
            <li key={marker.id}>
              <NumberInput
                onChange={(value) => {
                  setMarkers((prev) =>
                    prev.map((item) => {
                      if (item.id === marker.id) {
                        return { ...item, value: value };
                      }
                      return item;
                    })
                  );
                }}
                value={String(marker.value)}
              />
              <button
                onClick={() => {
                  setMarkers((prev) =>
                    prev.filter((item) => item.id !== marker.id)
                  );
                }}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.46094 12.5C1.46094 6.40382 6.40285 1.46191 12.499 1.46191C18.5951 1.46191 23.537 6.40382 23.537 12.5C23.537 18.596 18.5951 23.538 12.499 23.538C6.40285 23.538 1.46094 18.596 1.46094 12.5ZM12.499 3.04524C7.2773 3.04524 3.04428 7.27827 3.04428 12.5C3.04428 17.7217 7.2773 21.9547 12.499 21.9547C17.7206 21.9547 21.9536 17.7217 21.9536 12.5C21.9536 7.27827 17.7206 3.04524 12.499 3.04524ZM16.4218 8.57757C16.7471 8.90301 16.7471 9.43066 16.4218 9.75609L13.6777 12.5002L16.4218 15.2442C16.7471 15.5697 16.7471 16.0973 16.4218 16.4228C16.0963 16.7482 15.5687 16.7482 15.2433 16.4228L12.4992 13.6787L9.75511 16.4228C9.42968 16.7482 8.90203 16.7482 8.5766 16.4228C8.25116 16.0973 8.25116 15.5697 8.5766 15.2442L11.3207 12.5002L8.5766 9.75609C8.25116 9.43066 8.25116 8.90301 8.5766 8.57757C8.90203 8.25214 9.42968 8.25214 9.75511 8.57757L12.4992 11.3217L15.2433 8.57757C15.5687 8.25214 16.0963 8.25214 16.4218 8.57757Z"
                    fill="var(--color)"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
export default BoxDeepnesMarkup;
