import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "../services/user";
import clsx from "clsx";
import { setSessionToken } from "../services/shared";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import { selectIsAuthorized, setAuthorized } from "../stores/userSlice";
import { BadCredentialsError, LackOfDataError, responseErrorFactory, TBadResponse } from "../errors";

type AuthFormInputs = {
	username: string;
	password: string;
}

type AuthFormProps = {
	className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ className }) => {
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
		console.log(errors);
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
					setFormError(reason.message);
				} else if (reason instanceof LackOfDataError) {
					reason.fieldsErrors.forEach(({ alias, msg }) => setFieldError(alias as keyof AuthFormInputs, { type: "custom", message: msg }));
				} else if (reason instanceof Error) {
					alert(reason.message);
				}
			});
	};

	return (
		<form ref={formRef} className={clsx("sign_form", className)} onSubmit={handleSubmit(onSubmit)}>
			<div>
				<p>Электронная почта</p>
				<input required type="email" placeholder="Введите электронную почту" {...register("username")} />
				{"username" in errors && <div className="field-error">{errors.username?.message}</div>}
			</div>
			<div>
				<p>Пароль</p>
				<input required type="password" placeholder="Введите пароль"
					{...register("password")}
				/>
				{"password" in errors && <div className="field-error">{errors.password?.message}</div>}
			</div>
			<button type="submit" className={clsx("__btn _accent")} disabled={status === "pending"}>Войти</button>
			{formError && <div>{formError}</div>}
			<div className="sign_forgout">
				Забыли пароль?
			</div>
		</form>
	)
}
const RegForm: React.FC<AuthFormProps> = ({ className }) => {
	const formRef = useRef<HTMLFormElement>(null);
	const {
    register,
    handleSubmit,
  } = useForm<AuthFormInputs>();

  const onSubmit = () => {
	};

	return (
		<form ref={formRef} className={clsx("sign_form", className)} onSubmit={handleSubmit(onSubmit)}>
			<p>Электронная почта</p>
			<input required type="username" placeholder="Введите электронную почту"
				{...register("username")
			}/>
			<p>Пароль</p>
			<input required type="password" placeholder="Введите пароль"
				{...register("password")}
			/>
			<button type="submit" className="__btn _accent">Зарегистрироваться</button>
		</form>
	)
}

const Authorization = () => {
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
						<li>Инновации</li>
						<li>Геология</li>
						<li>Творчество</li>
					</ul>
				</div>
				<div className="sign_right">
					<div className="sign_logo">
						<img src="images/svg/logo.svg" alt=""/>
					</div>
					<div className="sign_block">
						<ul className="sign_tabs __grid-twoo">
							<li className={clsx(activeTab === "login" && "active")}>
								<button onClick={() => setActiveTab("login")}>Войти</button>
							</li>
							<li className={clsx(activeTab === "register" && "active")}>
								<button onClick={() => setActiveTab("register")}>Регистрация</button>
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
