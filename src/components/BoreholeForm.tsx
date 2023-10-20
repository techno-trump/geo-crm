import { useTranslation } from "react-i18next";
import boreholes from "../i18n/keys/boreholes";
import { useForm } from "react-hook-form";
import shared from "../i18n/keys/shared";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { useUpdateMutation, TBoreholeUpdateAttributes, useGetByIdQuery } from "../services/boreholes";
import { isNotEmptyString } from "../utils";

type TBoreholeFormInputs = {
	name: string;
	depth: number;
}

interface IBoreholeFormProps {
	boreholeId: number;
}
const BoreholeForm = ({ boreholeId }:IBoreholeFormProps) => {
	const { t: tBoreholes } = useTranslation(boreholes.__ns);
	const { t: tShared } = useTranslation(shared.__ns);
	const { data } = useGetByIdQuery(boreholeId);
	const [updateBorehole, status] = useUpdateMutation();
	const navigate = useNavigate();
	const defaultValues = { name: data?.name, depth: data?.depth };

	const {
		register,
		formState: { isSubmitting, isLoading, errors },
		handleSubmit
	} = useForm<TBoreholeFormInputs>({ defaultValues: defaultValues });

	const onCloseHandler = () => {
		if (confirm(tShared(shared.do_you_want_to_close))) {
			navigate("../", { replace: true });
		}
	}

	const onValidSubmit = (data: TBoreholeUpdateAttributes) => {
		updateBorehole({ id: boreholeId, data }).unwrap()
			.then(() => {
				alert(tShared(shared.successful_update));
			})
			.catch(reason => {
				alert(tShared(shared.update_error) + reason.message);
			})
			.then(() => {
				navigate("../", { replace: true });
			});
	}
	
	return (
		<Dialog open={true} onClose={onCloseHandler} className={"modal"}>
			<Dialog.Panel className={"modal__panel"}>
				<form className="create_form" onSubmit={handleSubmit(onValidSubmit)}>
					<div>
						<div className="create_form_title">{tBoreholes(boreholes.borehole_attributes_editing)}</div>
					</div>
					<div className="create_form_caption">{tBoreholes(boreholes.name) + "*"}</div>
					<input type="text"
						placeholder={tBoreholes(boreholes.enter_borehole_name)}
						{...register("name", { required: "required" })}
					/>
					{"name" in errors && <div className="field-error">{errors.name?.message}</div>}
					<div className="create_form_caption">{tBoreholes(boreholes.depth) + "*"}</div>
					<input type="text"
						placeholder={tBoreholes(boreholes.enter_depth)}
						{...register("depth", { required: "required" })}
					/>
					{"depth" in errors && <div className="field-error">{errors.depth?.message}</div>}
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

export const Container = () => {
	const { boreholeId: boreholeIdStr } = useParams();
	if (isNotEmptyString(boreholeIdStr) && boreholeIdStr.match(/\d+/)) {
		return <BoreholeForm boreholeId={Number(boreholeIdStr)} />;
	}
	return <div>Borehole id was not provided or invalid; Borehole ID: {boreholeIdStr}</div>;
}

export default Container;