import {
	AppLogo,
	DEFAULT_LOGO_SIZE,
	type LogoSize,
} from "#/components/AppLogo";
import { GAME_ID } from "#/games/clairobscur/core/constants";

type Remnant2LogoProps = {
	size?: LogoSize;
};

const ClairObscurLogo = ({ size = DEFAULT_LOGO_SIZE }: Remnant2LogoProps) => {
	// Logo sizes don't go lower than 64
	// The image path needs a safe size
	const safeSize = size < 64 ? 64 : size;

	return <AppLogo path={`games/${GAME_ID}/logos/${safeSize}C33.png`} />;
};

export { ClairObscurLogo };
