import { AppImage } from "#/components/AppImage";

type LogoSize = 24 | 36 | 48 | 64 | 128 | 256 | 512 | 1024;
const DEFAULT_LOGO_SIZE: LogoSize = 36;

type AppLogoProps = {
	path: string;
	size?: LogoSize;
};

const AppLogo = ({ path, size = DEFAULT_LOGO_SIZE }: AppLogoProps) => {
	return <AppImage src={path} w={size} h={size} />;
};

const CleanLogo = ({
	size = DEFAULT_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return <AppLogo path={`logos/128Clean.png`} size={size} />;
};

const DefaultLogo = ({
	size = DEFAULT_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return <AppLogo path={`logos/LogoToxicGreen.png`} size={size} />;
};

const AnimatedLogo = ({
	size = DEFAULT_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return (
		<AppLogo
			path={`logos/${size === 64 ? 64 : 128}GradientTK.gif`}
			size={size}
		/>
	);
};

export {
	AnimatedLogo,
	AppLogo,
	CleanLogo,
	DefaultLogo,
	DEFAULT_LOGO_SIZE,
	type LogoSize,
};
