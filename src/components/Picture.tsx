export type TPicture = {
	jpg: { src: string; srcSet?: string; };
	webp: { srcSet: string; };
}
export interface IPictureProps extends TPicture {};
const Picture = ({ jpg, webp }: IPictureProps) => {
	return (
		<picture>
			<source {...webp} type="image/webp"/>
			<img {...jpg}/>
		</picture>
	);
}
export default Picture;