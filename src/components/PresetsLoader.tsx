import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import { selectIsAuthorized, setData } from "../stores/userSlice";
import { useLazyGetCurrentUserQuery } from "../services/user";

const PresetsLoader =  () => {
	const isAuthorised = useAppSelector(selectIsAuthorized);
	const dispath = useAppDispatch();
	const [getCurrentUser] = useLazyGetCurrentUserQuery();

	// To do нужно переместить эту логику в thunk, что бы можно было перезагрузить эти данные по требованию

	useEffect(() => {
		if (isAuthorised) {
			getCurrentUser().unwrap()
				.then((result) => {
					if (("detail" in result) && result.detail === "Unauthorized") {
						throw new Error("Unathorised");
					} else {
						dispath(setData(result));
					}
				})
				.catch((reason) => {
					alert(`Error while fetching current user data:\n"${reason.message}\n${JSON.stringify(reason)}`);
				});
		}
	}, [isAuthorised]);

	return (<></>);
}

export default PresetsLoader;