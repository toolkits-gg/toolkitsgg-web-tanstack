import { Image as MantineImage, type ImageProps as MantineImageProps } from "@mantine/core";

type AppImageProps = MantineImageProps & {};

const AppImage = ({ src, ...rest }: AppImageProps) => {
	const resolvedSrc =
		src && typeof src === "string" && !src.startsWith("http")
			? `${import.meta.env.VITE_CLOUDFRONT_URL}/${src.replace(/^\//, "")}`
			: src;

	return <MantineImage src={resolvedSrc} {...rest} />;
};

export { AppImage, type AppImageProps };