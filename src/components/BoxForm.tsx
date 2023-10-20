import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import shared from "../i18n/keys/shared";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { useGetByIdQuery, useUpdateMutation } from "../services/boxes";
import boxes from "../i18n/keys/boxes";
import { isNotEmptyString } from "../utils";

type TBoxFormInputs = {
	interval_from: number;
	interval_to: number;
}

interface IBoxFormProps {
	boxId: number;
}
export const BoxForm = ({ boxId }:IBoxFormProps) => {
	const { t: tBoxes } = useTranslation(boxes.__ns);
	const { t: tShared } = useTranslation(shared.__ns);
	const [updateBox, status] = useUpdateMutation();
	// To do обиграть ts
	const { data: initialData } = useGetByIdQuery(boxId);

	// To do Заменить на адекватные вызовы API, когда появится возможность
	//const { data: projectBoreholes } = useGetById(state?.project_id);
	const navigate = useNavigate();

	const defaultValues = initialData && {
		interval_from: initialData?.interval_from,
		interval_to: initialData?.interval_to
	};

	const {
		register,
		formState: { isSubmitting, isLoading, errors },
		handleSubmit
	} = useForm<TBoxFormInputs>({ values: defaultValues });

	const onCloseHandler = () => {
		if (confirm(tShared(shared.do_you_want_to_close))) {
			navigate(-1);
		}
	}

	const onValidSubmit = (data: TBoxFormInputs) => {
		if (!initialData) return;
		const fullData = { ...initialData, ...data };
		updateBox({ id: fullData.id, data: fullData }).unwrap()
			.then(() => {
				alert(tShared(shared.successful_update));
			})
			.catch(reason => {
				alert(tShared(shared.update_error) + reason.message);
			})
			.then(() => {
				navigate(-1);
			});
	}
	
	return (
		<Dialog open={true} onClose={onCloseHandler} className={"modal"}>
			<Dialog.Panel className={"modal__panel"}>
				<form className="create_form" onSubmit={handleSubmit(onValidSubmit)}>
					<div>
						<div className="create_form_title">{tBoxes(boxes.box_attributes_editing)}</div>
					</div>
					<div className="create_form_caption">{tBoxes(boxes.interval_from) + "*"}</div>
					<input type="text"
						placeholder={tShared(shared.enter_value)}
						{...register("interval_from", { required: "required" })}
					/>
					{"interval_from" in errors && <div className="field-error">{errors.interval_from?.message}</div>}
					<div className="create_form_caption">{tBoxes(boxes.interval_to) + "*"}</div>
					<input type="text"
						placeholder={tShared(shared.enter_value)}
						{...register("interval_to", { required: "required" })}
					/>
					{"interval_to" in errors && <div className="field-error">{errors.interval_to?.message}</div>}
					<div className="form-bottom mt-30px">
						<div className="form-bottom__inner">
							<button type="button" className="__btn" onClick={onCloseHandler}>{tShared(shared.close)}</button>
							<button type="submit"
								disabled={isSubmitting || isLoading || status.isLoading}
								className="__btn _accent">{tShared(shared.save)}
							</button>
						</div>
					</div>
				</form>
			</Dialog.Panel>
		</Dialog>
	);
}

const Container = () => {
	const { boxId } = useParams();
	if (isNotEmptyString(boxId) && boxId.match(/\d+/)) {
		return <BoxForm boxId={Number(boxId)} />;
	}
	return <div>Box id was not provided or invalid; Box ID: {boxId}</div>;
} 
export default Container;