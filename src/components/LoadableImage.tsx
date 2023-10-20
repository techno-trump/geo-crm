import { api } from "../config";
import { TFileSchema } from "../types/shared-types";

const LoadableImage = ({ name, id }: TFileSchema) => {
	return (
		<img src={`${api.url}images/${id}`} alt={name}/>
	);
}
export default LoadableImage;