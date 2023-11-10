import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { To, useLocation, useNavigate } from "react-router-dom";
import { useCreateMutation } from "../services/boxes";
import PageHeader from "../components/PageHeader";
import { prepareActionsMeta } from "../components/Action";
import { TRawActionMeta, TNewActionsContext } from "../types/actions";
import { useMetaTranslate } from "../hooks";
import boxes from "../i18n/keys/boxes";
import shared from "../i18n/keys/shared";
import { TBoxRawData } from "../types/boxes";
import { AttachmentsPanel, ImageSelector } from "./NewBorehole";
import { TFileSchema } from "../types/shared-types";

const rawActionsMeta: Array<TRawActionMeta<TNewActionsContext>> = [
	// {
	// 	caption: { ns: projects.__ns, key: projects.load_project },
	// 	Icon: DownloadIcon,
	// 	onClickFactory: (_) => () => {},
	// }
];

export type TNewProjectFormInputs = {
	image: string;
	boreholeId: string;
}

const NewProject = () => {
	const [imagesToLoad, setImagesToLoad] = useState<Array<File>>([]);
	const [loadedImages, setLoadedImages] = useState<Map<File, TFileSchema>>(new Map());
	const imagesArray = Array.from(loadedImages, (entry) => entry[1]);
	const tMeta = useMetaTranslate();
	const formRef = useRef<HTMLFormElement>(null);
	const [createBox] = useCreateMutation();
	const { state } = useLocation();
	const navigate = useNavigate();
	const { t: tBoxes } = useTranslation(boxes.__ns);
	const { t: tShared } = useTranslation(shared.__ns);
	const defaultValues = { image: "", boreholeId: state?.boreholeId };
	const {
		register,
		trigger,
		getValues,
		formState: { isSubmitting, isLoading, errors }
	} = useForm<TNewProjectFormInputs>({ defaultValues: defaultValues });
	const pageTitle = tBoxes(boxes.new_box_creation);
	const submitHandlerFactory = (nextTo: number | string) => () => {
		trigger()
			.then(valid => {
				if (!valid) return;
				const formData = getValues();
				const boreholeId = Number(formData.boreholeId);
				const boxRawData: TBoxRawData = {
					borehole_id: boreholeId,
					interval_from: 0,
					interval_to: 0,
					length: 0,
					scr: 0,
					vein_material: 0,
					number: 0,
					status: "created",
					image: imagesArray[0],
				}
				createBox(boxRawData).unwrap()
					.then(() => {
						// To do перевод, react component вместо alert
						setImagesToLoad([]);
						setLoadedImages(new Map());
						alert("Ящик был успешно создан");
						navigate(nextTo as To, { replace: true });
					})
					.catch(reason => {
						// To do перевод, react component вместо alert
						alert("Ошибка при создании ящика: " + reason.message);
					});
			})
	};
	const actionsMeta = prepareActionsMeta(rawActionsMeta, { tMeta, navigate });

	return (
		<>
			<PageHeader title={pageTitle} actions={actionsMeta}/>
			<div className="create wrapper">
				<div className="create_net __flex">
					<div className="create_left">
						<form ref={formRef} className="create_form">
							<div className="create_form_title">{tShared(shared.basic_info)}</div>
							<div className="create_form_caption">{tShared(shared.borehole_id) + "*"}</div>
							<input type="text" disabled {...register("boreholeId", { required: "required" })}/>
							{"name" in errors && <div className="field-error">{errors.boreholeId?.message}</div>}
							<div className="create_form_btn">
								<ImageSelector disabled={Boolean(imagesToLoad.length || loadedImages.size)} onSelected={(selected) => setImagesToLoad(current => [...current, ...selected])} />
								{/* <button className="__btn _accent">{tShared(shared.continue)}</button> */}
								<button type="button"
									onClick={submitHandlerFactory(-1)}
									disabled={isSubmitting || isLoading || !loadedImages.size}
									className="__btn _accent mt-15px">{tShared(shared.create)}
								</button>
								<button type="button"
									disabled={isSubmitting || isLoading || !loadedImages.size}
									onClick={submitHandlerFactory("/boxes/new")}
									className="__btn _accent mt-15px">{tBoxes(boxes.create_this_and_one_more)}
								</button>
							</div>
						</form>
					</div>
					<AttachmentsPanel attachments={imagesToLoad} loaded={loadedImages} setLoaded={setLoadedImages} />
				</div>
			</div>
		</>
	);
};

export default NewProject;
