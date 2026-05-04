import { Image, type ImageProps } from "@mantine/core";

type AppImageProps = ImageProps & {};

const AppImage = ({ src, ...rest }: AppImageProps) => {
	const resolvedSrc =
		src && typeof src === "string" && !src.startsWith("http")
			? `${import.meta.env.VITE_CLOUDFRONT_URL}/${src.replace(/^\//, "")}`
			: src;

	return <Image src={resolvedSrc} {...rest} />;
};

export { AppImage, type AppImageProps };
