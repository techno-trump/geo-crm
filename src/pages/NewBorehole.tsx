import projects from "../i18n/keys/projects";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { prepareActionsMeta } from "../components/Action";
import { DownloadIcon } from "../components/icons";
import boreholes from "../i18n/keys/boreholes";
import shared from "../i18n/keys/shared";
import { useForm } from "react-hook-form";
import { ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction, useCallback, useState } from "react";
import clsx from "clsx";
import { useUploadMutation } from "../services/images";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { useCreateMutation } from "../services/boreholes";
import { TFileSchema } from "../types/shared-types";
import { TBoreholeRawData } from "../types/boreholes";
import { useDidFirstMountEffect, useMetaTranslate } from "../hooks";
import { TNewActionsContext, TRawActionMeta } from "../types/actions";

const rawActionsMeta: Array<TRawActionMeta<TNewActionsContext>> = [
		{
			caption: { ns: projects.__ns, key: projects.new_project },
			Icon: DownloadIcon,
			onClickFactory: ({ navigate }) => () => { navigate("/projects/new") },
		}
	];
interface IImageSelector {
	onSelected: (selected: Array<File>) => void;
	disabled?: boolean;
	multiple?: boolean;
}
export const ImageSelector = ({ onSelected, disabled, multiple }: IImageSelector) => {
	const { t: tShared } = useTranslation(shared.__ns);

	const onChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(({ target }) => {
		if (target.files) onSelected(Array.from(target.files));
		target.value = "";
	}, [onSelected]);

	return (
		<label className={clsx("file-select", disabled && "disabled")}>
			<input type="file"
				disabled={disabled}
				accept="image/*"
				multiple={multiple}
				className="__input_hidden"
				onChange={onChangeHandler}
			/>
			<div className="__btn">{tShared(shared.load_files)}</div>
		</label>
	);
}
interface IAttachmentProps {
	file: File;
	onLoaded?: (file: File, fileData: TFileSchema) => void;
	onError?: (file: File) => void;
	onAfterRemove?: (file: File) => void;
}

//type TAttachmentStatus = "initial" | "uploading" | "uploaded" | "error";
const Attachment = ({ file, onLoaded, onError, onAfterRemove }: IAttachmentProps) => {
	const [uploadImages, result] = useUploadMutation();
	
	const uploadImageHandler = () => {
		const formData = new FormData();
		formData.append("files", file);
		uploadImages(formData).unwrap()
			.then((result) => {
				onLoaded && onLoaded(file, result[0]);
			})
			.catch(() => onError && onError(file));
	}

	useDidFirstMountEffect(() => {
		uploadImageHandler();
	});

	// To do Проработать удаление
	// To do повторная загрузка при ошибке

	const onRemoveHandler = () => {
		Promise.resolve()
			.then(() => onAfterRemove && onAfterRemove(file));
	}

	return (
		<div className="attachment">
			{
				(result.status !== QueryStatus.fulfilled) ?
				<div className="spinner spinner_sm"></div> :
				<button type="button" className="attachment__drop" onClick={onRemoveHandler}>remove</button>
			}
			<p>{file.name}</p>
		</div>
	)
}
interface IAttachmentsPanelProps {
	attachments: Array<File>;
	loaded: Map<File, TFileSchema>;
	setLoaded: Dispatch<SetStateAction<Map<File, TFileSchema>>>;
}
export const AttachmentsPanel = ({ attachments, loaded, setLoaded }: IAttachmentsPanelProps) => {
	const { t: tShared } = useTranslation(shared.__ns);

	const onLoadedHandler = (file: File, fileData: TFileSchema) => {
		setLoaded((current) => {
			const newState = new Map(current);
			newState.set(file, fileData);
			return newState;
		});
	}

	return (
		<div className="create_files">
			<div className="create_files_top __flex-center">
				<div className="create_files_title">{tShared(shared.selected_files_number)}: {loaded.size}</div>
				{/* <div className="create_files_select _select">
					<select>
							<option value="0">По названию</option>
							<option value="1">По названию 1</option>
							<option value="2">По названию 2</option>
							<option value="3">По названию 3</option>
					</select>
				</div> */}
			</div>
			<ul className="create_files_list">
				{attachments.map((file, idx) => <li key={idx}><Attachment file={file} onLoaded={onLoadedHandler} /></li>)}
			</ul>
		</div>
	);
}

type TNewBoreholeFormInputs = {
	images: Array<TFileSchema>;
	project_id: number;
	name: string;
	depth: number | null;
}
const NewBorehole = () => {
	const navigate = useNavigate();
	const [createBorehole] = useCreateMutation();
	const tMeta = useMetaTranslate();
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { t: tShared } = useTranslation(shared.__ns);
	const pageTitle = tBoreholes(boreholes.new_borehole_creation);
	const { state } = useLocation();
	const newBoreholeFormDefaultValues = {
		project_id: state && ("projectId" in state) && Number(state.projectId),
		name: "",
		depth: null,
	}
	const [imagesToLoad, setImagesToLoad] = useState<Array<File>>([]);
	const [loadedImages, setLoadedImages] = useState<Map<File, TFileSchema>>(new Map());
	const {
		register,
		trigger,
		getValues,
		formState: { errors }
	} = useForm<TNewBoreholeFormInputs>({ defaultValues: newBoreholeFormDefaultValues });

	// const onValidSubmit: SubmitHandler<TNewProjectFormInputs> = (rawData) => {
	// }

	const createAndReturnActionHandler: MouseEventHandler<HTMLButtonElement> = () => {
		trigger()
			.then(valid => {
				if (!valid) return;
				const formData = getValues();
				formData.images = imagesToLoad.filter(file => loadedImages.has(file)).map(file => loadedImages.get(file)!);
				createBorehole(formData as TBoreholeRawData).unwrap()
					.then(() => {
						alert("Скважина была успешно создана");
					})
					.catch(reason => {
						alert("Ошибка при создании скважины: " + reason.message);
					})
					.then(() => {
						navigate("/");
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
						<form className="create_form">
							<div className="create_form_title">{tBoreholes(boreholes.new_borehole_form_title)}</div>
							<div className="create_form_caption">{tBoreholes(boreholes.project_id)}</div>
							<input type="text" disabled
								{ ...register("project_id", { required: "required" }) }
								placeholder={tBoreholes(boreholes.project_id)}
							/>
							{"project_id" in errors && <div className="field-error">{errors.project_id?.message}</div>}
							<div className="create_form_caption">{tBoreholes(boreholes.name)}</div>
							<input type="text"
								{ ...register("name", { required: "required" }) }
								placeholder={tBoreholes(boreholes.enter_borehole_name)}
							/>
							{"name" in errors && <div className="field-error">{errors.name?.message}</div>}
							<div className="create_form_caption">{tBoreholes(boreholes.depth)}</div>
							<input type="number"
								{ ...register("depth", { required: "required" }) }
								placeholder={tBoreholes(boreholes.enter_depth)}/>
							{"depth" in errors && <div className="field-error">{errors.depth?.message}</div>}
							<div className="create_form_btn">
								<ImageSelector multiple={true} onSelected={(selected) => setImagesToLoad(current => [...current, ...selected])} />
								<button
									type="button"
									onClick={createAndReturnActionHandler}
									disabled={imagesToLoad.length !== loadedImages.size}
									className="__btn _accent">{tShared(shared.create)}
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

export default NewBorehole;
