export function isNotEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.length > 0;
}
export const toFixed = (value: string | number, number: number) => {
	return Number(value).toFixed(number);
}