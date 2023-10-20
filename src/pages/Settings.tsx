import { langs, TLanguages, TLanguagesIsoCode } from "../i18n";
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { selectLang, changeLang } from '../stores/settingsSlice';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import settings from '../i18n/keys/settings';
import roles from '../i18n/keys/roles';
import Select from "react-select";
import { userRoles } from "../constants";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useDeleteMutation, useGetAllUsersQuery, useRegisterMutation } from "../services/user";

const LanguageSelect = () => {
	const selectedLang = useAppSelector(selectLang);
	const dispatch = useAppDispatch();
	const { t: tShared } = useTranslation("shared");
	const { t: tSettings } = useTranslation("settings");
	

	const onChangeHandler: FormEventHandler<HTMLUListElement> = ({ target }) => {
		if (target && "value" in target) {
			dispatch(changeLang(target.value as TLanguagesIsoCode));
		}
	}
	
	return (
		<div className="setting_block">
			<div className="setting_title">{tSettings(settings.language_select)}</div>
			<ul className="setting_lang" onChange={onChangeHandler}>
				{Object.keys(langs).map((langIsoCode) => {
						return (
							<li key={langIsoCode}>
								<label>
									<input type="radio" name="lang" value={langIsoCode} defaultChecked={selectedLang === langIsoCode} />
									<span>{tShared(langs[langIsoCode  as keyof TLanguages].nativeName.toLowerCase())}</span>
								</label>
							</li>);
					})
				}
			</ul>
		</div>
	);
}
const ActionOnModel = () => {
	return (
		<div className="setting_block">
			<div className="setting_title">Дообучение модели</div>
			<div className="setting_select _select">
						<select>
								<option value="placeholder">Выбор модели</option>
								<option value="1">Модель 1</option>
								<option value="2">Модель 2</option>
								<option value="3">Модель 3</option>
						</select>
				</div>
				<button className="__btn">Применить</button>
		</div>
	);
}
const userFormDefaultFalues = {
	email: "",
	password: "",
	role: null,
}
type TNewUserFormInputs = {
	email: string;
	password: string;
	role: string | null;
}

type TSelectOptionData = {
	value: string;
	label: string;
}
type TSelectOptions = Array<TSelectOptionData>;

const NewUserForm = () => {
	const { t: tSettings } = useTranslation(settings.__ns);
	const { t: tRoles } = useTranslation(roles.__ns);
	const { register, control, handleSubmit, reset } = useForm<TNewUserFormInputs>({ defaultValues: userFormDefaultFalues });
	const [registerUser, result] = useRegisterMutation();

	const roleOptions: TSelectOptions = useMemo(() => userRoles.map(roleData => {
			return { value: roleData.alias, label: tRoles(roleData.nameLangKey) }
		}), [userRoles, tRoles]);

	const onValidSubmit: SubmitHandler<TNewUserFormInputs> = ({ email, password, role }) => {
		registerUser({
			email,
			password,
			is_superuser: role === "admin",
			is_active: true,
			is_verified: true,
		});
	}

	useEffect(() => {
		if (result.isError) {
			alert("Ошибка при создании пользователя:\n" + JSON.stringify(result.error));
		} else if (result.isSuccess) {
			reset();
			alert("Пользователь был успешно создан");
		}
	}, [result]);
	
	return (
		<form className="setting_block" onSubmit={handleSubmit(onValidSubmit)}>
			<div className="setting_title">{tSettings(settings.new_user)}</div>
			<div className="setting_caption">{tSettings(settings.post_address) + "*"}</div>
			<input required type="email" placeholder={tSettings(settings.enter_post_address)} {...register("email")} />
			<div className="setting_caption">{tSettings(settings.password) + "*"}</div>
			<input required type="password" placeholder={tSettings(settings.enter_password)} {...register("password")} />
			<div className="setting_caption">{tSettings(settings.permissions) + "*"}</div>
			<Controller
				control={control}
				name="role"
				render={({ field }) => {
						const { onChange } = field;
						return <Select
							classNamePrefix="rs"
							onChange={(selected) => { onChange(selected ? selected.value : selected); }}
							placeholder={tSettings(settings.permissions_level_select)}
							options={roleOptions}
							isClearable
							required
						/>
					}
				}
			/>
			<button type="submit" className="__btn">{tSettings(settings.add_user)}</button>
		</form>
	);
}
const UsersList = () => {
	const { t: tSettings } = useTranslation(settings.__ns);
	const { data } = useGetAllUsersQuery();
	const [deleteUser] = useDeleteMutation();
	const [selectedUsers, setSelectedUsers] = useState<Array<string>>([]);

	const onSubmitHandler: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		if (selectedUsers.length) {
			Promise.all(selectedUsers.map(userId => deleteUser(userId).unwrap()))
				.then(() => {
					alert("Пользователи были успешно удалены");
				})
				.catch((reason) => {
					alert("Ошибка при удалении пользователей" + reason.message);
				})
		}
	}

	const selectOptions = data && (data instanceof Array) && data.map(({ id, email }) => ({ value: id, label: email })) || []

	return (
		<form className="setting_block" onSubmit={onSubmitHandler}>
			<div className="setting_title">{tSettings(settings.delete_users)}</div>
			<div className="setting_caption">{tSettings(settings.select_users)}</div>
			<Select
				isMulti
				options={selectOptions}
				placeholder={tSettings(settings.start_entering_name)}
				onChange={(newValue => setSelectedUsers(newValue.map(({ value }) => value)))}
				required
			/>
			<button type="submit" className="__btn">{tSettings(settings.delete_users)}</button>
		</form>
	);
}

const Setting = () => {
	return (
		<>
			<section className="setting">
				<div className="setting_top __flex">
					<LanguageSelect/>
					<ActionOnModel/>
				</div>
				<div className="setting_bottom __flex">
					<NewUserForm />
					<UsersList />
				</div>
		</section>
		</>
	);
};

export default Setting;

