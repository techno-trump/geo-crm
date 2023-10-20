type TLackOfDataError = {
	loc: Array<string>;
	msg: "field required";
	type: "value_error.missing";
}
type TErrorsList = Array<TLackOfDataError>;
//type TResponseStatus = 400 | 422;
type TBadCredentialsResponse = { status: 400, data: { detail: "LOGIN_BAD_CREDENTIALS"; } };
type TLackOfDataResponse = { status: 422, data: { detail: TErrorsList; } };
type TFieldError = { alias: string; msg: string; };
type TFieldsErrors = Array<TFieldError>;
export type TBadResponse = TLackOfDataResponse | TBadCredentialsResponse;
function formatLackOfData(errorsList: TErrorsList) {
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
export class LackOfDataError extends Error {
	public fieldsErrors: TFieldsErrors;
	constructor(responseError: TLackOfDataResponse) {
		super("lack of data");
		const { fieldsErrors } = formatLackOfData(responseError.data.detail);
		this.fieldsErrors = fieldsErrors;
	}
}
export class UnauthorizedError extends Error {
	constructor() {
		super("Unauthorized");
	}
}

export function responseErrorFactory(responseError: TBadResponse) {
	switch(responseError.status) {
		case 400:
			return new BadCredentialsError(responseError);
		case 422:
			return new LackOfDataError(responseError);
		default:
			return new Error(JSON.stringify(responseError));
	}
}

