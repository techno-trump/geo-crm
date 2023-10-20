import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import projects from "../i18n/keys/projects";
import { useTranslation } from "react-i18next";
import { useMemo, useRef } from "react";
import { To, useLocation, useNavigate } from "react-router-dom";
import { projectTypes } from "../constants";
import { TProjectOption, TProjectRawData, TProjectType } from "../types/projects";
import { useCreateMutation } from "../services/projects";
import { DownloadIcon } from "../components/icons";
import PageHeader from "../components/PageHeader";
import { prepareActionsMeta } from "../components/Action";
import { TRawActionMeta, TNewActionsContext } from "../types/actions";
import { useMetaTranslate } from "../hooks";

const rawActionsMeta: Array<TRawActionMeta<TNewActionsContext>> = [
	{
		caption: { ns: projects.__ns, key: projects.load_project },
		Icon: DownloadIcon,
		onClickFactory: (_) => () => {},
	}
];

export type TNewProjectFormInputs = {
	type: string;
	name: string;
}

const NewProject = () => {
	const tMeta = useMetaTranslate();
	const formRef = useRef<HTMLFormElement>(null);
	const [createProject] = useCreateMutation();
	const { state } = useLocation();
	const navigate = useNavigate();
	const { t: tProjects } = useTranslation(projects.__ns);
	const defaultValues = useMemo(() => ({ name: "", type: state?.type }), [state]);
	const {
		register,
		control,
		trigger,
		getValues,
		formState: { isSubmitting, isLoading, errors }
	} = useForm<TNewProjectFormInputs>({ defaultValues: defaultValues });
	const pageTitle = tProjects(projects.new_project_creation);

	// const onValidSubmit: SubmitHandler<TNewProjectFormInputs> = (rawData) => {
		
	// }

	const submitHandlerFactory = (nextTo: To) => () => {
		trigger()
			.then(valid => {
				if (!valid) return;
				createProject(getValues() as TProjectRawData).unwrap()
					.then((data) => {
						alert("Проект был успешно создан");
						navigate(nextTo, { state: { projectId: data.id } });
					})
					.catch(reason => {
						alert("Ошибка при создании проекта: " + reason.message);
					});
			})
	};

	const typeSelectOptions = useMemo<Array<TProjectOption>>(() =>
			projectTypes.map(({ alias, nameLangKey }) => ({
				value: alias as TProjectType,
				label: tProjects(projects[nameLangKey as keyof typeof projects])
			})),
		[tProjects]);
	const defaultTypeOption = useMemo(() => typeSelectOptions.find(({ value }) => value === state?.type), [state]);
	const actionsMeta = prepareActionsMeta(rawActionsMeta, { tMeta, navigate });

	return (
		<>
			<PageHeader title={pageTitle} actions={actionsMeta}/>
			<div className="create wrapper _center">
				<form ref={formRef} className="create_form">
					<div className="create_form_title">{tProjects(projects.basic_info)}</div>
					<div className="create_form_caption">{tProjects(projects.name) + "*"}</div>
					<input type="text" placeholder={tProjects(projects.enter_name)} {...register("name", { required: "required" })}/>
					{"name" in errors && <div className="field-error">{errors.name?.message}</div>}
					<div className="create_form_caption">{tProjects(projects.project_type) + "*"}</div>
					<Controller
						control={control}
						name="type"
						rules={{ required: "required" }}
						render={({ field }) => {
								const { onChange } = field;
								return <Select
									classNamePrefix="rs"
									defaultValue={defaultTypeOption}
									onChange={(selected) => { onChange(selected ? selected.value : selected); }}
									placeholder={tProjects(projects.select_type)}
									options={typeSelectOptions}
									isClearable
								/>
							}
						}
					/>
					{"type" in errors && <div className="field-error">{errors.type?.message}</div>}
					<div className="create_form_btn">
						{/* <button className="__btn _accent">{tShared(shared.continue)}</button> */}
						<button type="button"
							onClick={submitHandlerFactory("../")}
							disabled={isSubmitting || isLoading}
							className="__btn _accent">{tProjects(projects.create)}
						</button>
						<button type="button"
							disabled={isSubmitting || isLoading}
							onClick={submitHandlerFactory("/boreholes/new")}
							className="__btn _accent mt-15px">{tProjects(projects.create_and_add_borehole)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
};

export default NewProject;
