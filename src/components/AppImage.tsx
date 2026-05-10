import { Image as IKImage, type IKImageProps } from "@imagekit/react";
import { Image as MantineImage } from "@mantine/core";

type AppImageProps = IKImageProps & {};

const AppImage = ({ width, height, ...rest }: AppImageProps) => {
	return (
		<MantineImage
			component={IKImage}
			transformation={[{ width, height }]}
			{...rest}
		/>
	);
};

export { AppImage, type AppImageProps };
