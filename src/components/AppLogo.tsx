import { Image } from "@mantine/core";

type LogoSize = 24 | 36 | 48 | 64 | 128 | 256 | 512 | 1024;

const DEFAULT_LOGO_SIZE: LogoSize = 36;

const LOGOS_URL = "https://d1ig3kkc8hj9hz.cloudfront.net/logos";

type AppLogoProps = {
	path: string;
	alt: string;
	size?: LogoSize;
};

const AppLogo = ({ path, size = DEFAULT_LOGO_SIZE, alt }: AppLogoProps) => {
	return <Image src={path} alt={alt} w={size} h={size} loading="eager" />;
};

const CleanLogo = ({
	size = DEFAULT_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return (
		<AppLogo
			path={`${LOGOS_URL}/128Clean.png`}
			size={size}
			alt="Logo of a purple and yellow toolbox."
		/>
	);
};

const DefaultLogo = ({
	size = DEFAULT_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return (
		<AppLogo
			path={`${LOGOS_URL}/LogoToxicGreen.png`}
			size={size}
			alt="Logo of a purple and yellow toolbox."
		/>
	);
};

const AnimatedLogo = ({
	size = DEFAULT_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return (
		<AppLogo
			path={`${LOGOS_URL}/${size === 64 ? 64 : 128}GradientTK.gif`}
			size={size}
			alt="Animated logo of a purple and yellow toolbox."
		/>
	);
};

export {
	AnimatedLogo,
	AppLogo,
	type AppLogoProps,
	CleanLogo,
	DefaultLogo,
	type DEFAULT_LOGO_SIZE,
	type LogoSize,
};
