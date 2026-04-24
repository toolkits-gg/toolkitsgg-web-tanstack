import { Image, type ImageProps } from "@mantine/core";
import { clientEnv } from "#/config/client-env";

type AppImageProps = ImageProps & {};

const AppImage = ({ src, ...rest }: AppImageProps) => {
	const resolvedSrc =
		src && typeof src === "string" && !src.startsWith("http")
			? `${clientEnv.VITE_CLOUDFRONT_URL}/${src.replace(/^\//, "")}`
			: src;

	return <Image src={resolvedSrc} {...rest} />;
};

export { AppImage, type AppImageProps };
