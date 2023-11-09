export function formatValidationErrors(errorsList: TErrorsList) {
	const fieldsErrors: TFieldsErrors = [];
	errorsList.forEach(({ type, loc, msg }) => {
		switch(type) {
			case "value_error.missing":
				fieldsErrors.push({ alias: loc[1], msg });
		}
	});
	return { fieldsErrors };
}

export class BadCredentialsError extends Error {
	constructor(responseError: TBadCredentialsResponse) {
		super(responseError.data.detail);
	}
}
export class ValidationError extends Error {
	public fieldsErrors: TFieldsErrors;
	constructor(responseError: TValiadtionErrorResponse) {
		super("Validation error");
		const { fieldsErrors } = formatValidationErrors(responseError.data.detail);
		this.fieldsErrors = fieldsErrors;
	}
}
export class UserAlreadyExistError extends Error {
	constructor(_: TUserAlreadyExistResponse) {
		super("User already exists");
	}
}
export class UnauthorizedError extends Error {
	constructor() {
		super("Unauthorized");
	}
}

type TValidationError = {
	loc: Array<string>;
	msg: "field required";
	type: "value_error.missing";
}
type TErrorsList = Array<TValidationError>;
// type TResponseStatus = 400 | 422;
export type TBadCredentialsResponse = { status: 400, data: { detail: "LOGIN_BAD_CREDENTIALS"; } };
export type TUserAlreadyExistResponse = { status: 400, data: { detail: "REGISTER_USER_ALREADY_EXISTS"; } }
export type TValiadtionErrorResponse = { status: 422, data: { detail: TErrorsList; } };
export type TBadResponse = TValiadtionErrorResponse | TBadCredentialsResponse | TUserAlreadyExistResponse;

type TFieldError = { alias: string; msg: string; };
type TFieldsErrors = Array<TFieldError>;

export function isBadCredentialsErrorResponse(response: TBadResponse): response is TBadCredentialsResponse {
	return response.status === 400 && response.data.detail === "LOGIN_BAD_CREDENTIALS";
}
export function isUserAlreadyExistResponse(response: TBadResponse): response is TUserAlreadyExistResponse {
	return response.status === 400 && response.data.detail === "REGISTER_USER_ALREADY_EXISTS";
}
export function isValidationErrorResponse(response: TBadResponse): response is TValiadtionErrorResponse {
	return response.status === 422;
}

export function responseErrorFactory(response: TBadResponse) {
	if (isValidationErrorResponse(response)) {
		return new ValidationError(response);
	} else if (isBadCredentialsErrorResponse(response)) {
		return new BadCredentialsError(response);
	} else if(isUserAlreadyExistResponse(response)) {
		return new UserAlreadyExistError(response);
	} else {
		return new Error(JSON.stringify(response));
	}
}

