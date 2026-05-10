import { Image as IKImage, type IKImageProps } from "@imagekit/react";
import { Image as MantineImage } from "@mantine/core";

type AppImageProps = IKImageProps & {};

const AppImage = ({ width, height, ...rest }: AppImageProps) => {
	return (
		<MantineImage
			component={IKImage}
			urlEndpoint={import.meta.env.VITE_IMAGEKIT_ENDPOINT_URL}
			transformation={[{ width, height }]}
			{...rest}
		/>
	);
};

export { AppImage, type AppImageProps };
