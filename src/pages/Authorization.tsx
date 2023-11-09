import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation, useRegisterMutation } from "../services/user";
import clsx from "clsx";
import { setSessionToken } from "../services/shared";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import { selectIsAuthorized, setAuthorized } from "../stores/userSlice";
import { BadCredentialsError, ValidationError, responseErrorFactory, TBadResponse, isValidationErrorResponse, formatValidationErrors, isUserAlreadyExistResponse } from "../errors";
import { useTranslation } from "react-i18next";
import shared from "../i18n/keys/shared";

type AuthFormInputs = {
	username: string;
	password: string;
}

type AuthFormProps = {
	className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ className }) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const [formError, setFormError] = useState<string | null>(null);
	const formErrorEreaseTimeoutRef = useRef<number | null>(null);
	const dispatch = useAppDispatch();
	const formRef = useRef<HTMLFormElement>(null);
	const [login, { status }] = useLoginMutation();
	const {
    register,
    handleSubmit,
		setError: setFieldError,
		formState: { errors }
  } = useForm<AuthFormInputs>({ defaultValues: { username: "", password: "" } });

	useEffect(() => {
		if (formError?.length) {
			if (formErrorEreaseTimeoutRef.current !== null) {
				clearTimeout(formErrorEreaseTimeoutRef.current);
			}
			formErrorEreaseTimeoutRef.current = setTimeout(() => {
				setFormError(null);
			}, 5000);
		}
	}, [formError]);

  const onSubmit = () => {
		login(new FormData(formRef.current!))
			.then((response) => {
				if ("data" in response) {
					setSessionToken(response.data.access_token);
					dispatch(setAuthorized());
				} else {
					throw responseErrorFactory(response.error as TBadResponse);
					// {"status":422,"data":{"detail":[{"loc":["body","username"],"msg":"field required","type":"value_error.missing"}]}}
				}
			})
			.catch((reason) => {
				if (reason instanceof BadCredentialsError) {
					setFormError(tShared(reason.message));
				} else if (reason instanceof ValidationError) {
					reason.fieldsErrors.forEach(({ alias, msg }) => setFieldError(alias as keyof AuthFormInputs, { type: "custom", message: msg }));
				} else if (reason instanceof Error) {
					setFormError(reason.message);
				}
			});
	};

	return (
		<form ref={formRef} className={clsx("sign_form", className)} onSubmit={handleSubmit(onSubmit)}>
			<div>
				<p>{tShared(shared.email)}</p>
				<input required type="email" placeholder={tShared(shared.enter_email)} {...register("username")} />
				{"username" in errors && <div className="field-error">{errors.username?.message}</div>}
			</div>
			<div>
				<p>{tShared(shared.password)}</p>
				<input required type="password" placeholder={tShared(shared.enter_password)}
					{...register("password")}
				/>
				{"password" in errors && <div className="field-error">{errors.password?.message}</div>}
			</div>
			<button type="submit" className={clsx("__btn _accent")} disabled={status === "pending"}>{tShared(shared.enter)}</button>
			{formError && <div>{formError}</div>}
			<div className="sign_forgout">
			{tShared(shared.forgot_the_password)}
			</div>
		</form>
	)
}
const RegForm: React.FC<AuthFormProps> = ({ className }) => {
	const { t: tShared } = useTranslation(shared.__ns);
	const [formError, setFormError] = useState<string | null>(null);
	const formErrorEreaseTimeoutRef = useRef<number | null>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [registerUser] = useRegisterMutation();
	const {
    register,
    handleSubmit,
		setError: setFieldError,
		formState: { errors }
  } = useForm<AuthFormInputs>({ defaultValues: { username: "", password: "" } });

	useEffect(() => {
		if (formError?.length) {
			if (formErrorEreaseTimeoutRef.current !== null) {
				clearTimeout(formErrorEreaseTimeoutRef.current);
			}
			formErrorEreaseTimeoutRef.current = setTimeout(() => {
				setFormError(null);
			}, 5000);
		}
	}, [formError]);

  const onSubmit = ({ username, password }: AuthFormInputs) => {
		registerUser({
			email: username,
			password,
			is_active: true,
			is_superuser: true,
			is_verified: false,
		}).unwrap()
			.then((_) => {
				// To do заменить на react component и добавить перевод
				alert("Регистрация завершена");
			})
			.catch((reason: TBadResponse | Error) => {
				if (reason instanceof Error) {
					setFormError(reason.message);
				} else {
					if (isValidationErrorResponse(reason)) {
						formatValidationErrors(reason.data.detail)
							.fieldsErrors
							.forEach(({ alias, msg }) => setFieldError(alias as keyof AuthFormInputs, { type: "custom", message: msg }));
					} else if (isUserAlreadyExistResponse(reason)) {
						setFormError(tShared(reason.data.detail));
					}
				}
			});
	};

	return (
		<form ref={formRef} className={clsx("sign_form", className)} onSubmit={handleSubmit(onSubmit)}>
			<p>{tShared(shared.email)}</p>
			<div>
				<input required type="username" placeholder={tShared(shared.enter_email)}
					{...register("username")
				}/>
				{"username" in errors && <div className="field-error">{errors.username?.message}</div>}
			</div>
			<div>
				<p>{tShared(shared.password)}</p>
				<input required type="password" placeholder={tShared(shared.enter_password)}
					{...register("password")}
				/>
			</div>
			<button type="submit" className="__btn _accent">{tShared(shared.register)}</button>
			{"password" in errors && <div className="field-error">{errors.password?.message}</div>}
			{formError && <div>{formError}</div>}
		</form>
	)
}

const Authorization = () => {
	const { t: tShared } = useTranslation(shared.__ns);
	const isAuthorised = useAppSelector(selectIsAuthorized);
	const [activeTab, setActiveTab] = useState<"login" | "register">("login");
	
	if (isAuthorised) return <Navigate to="/"/>;

	return (
		<section className="sign">
			<div className="sign_net __flex-center">
				<div className="sign_left">
					<div className="sign_img">
						<picture>
							<source srcSet="images/authorization/sign.webp" type="image/webp"/>
							<img src="images/authorization/sign.jpg" alt="" srcSet="images/authorization/sign.jpg 1x, images/authorization/sign@2x.jpg 2x"/>
						</picture>
					</div>
					<ul className="sign_bottom __flex">
						<li>{tShared(shared.innovation)}</li>
						<li>{tShared(shared.geology)}</li>
						<li>{tShared(shared.creativity)}</li>
					</ul>
				</div>
				<div className="sign_right">
					<div className="sign_logo">
						<img src="images/svg/logo.svg" alt=""/>
					</div>
					<div className="sign_block">
						<ul className="sign_tabs __grid-twoo">
							<li className={clsx(activeTab === "login" && "active")}>
								<button onClick={() => setActiveTab("login")}>{tShared(shared.enter)}</button>
							</li>
							<li className={clsx(activeTab === "register" && "active")}>
								<button onClick={() => setActiveTab("register")}>{tShared(shared.registration)}</button>
							</li>
						</ul>
						<div className="sign_wrapper">
							<div className={clsx("disclosure", activeTab === "login" && "open")}>
								<div className="disclosure__inner">
									<AuthForm />
								</div>
							</div>
							<div className={clsx("disclosure", activeTab === "register" && "open")}>
								<div className="disclosure__inner">
									<RegForm className="disclosure__inner" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Authorization;
