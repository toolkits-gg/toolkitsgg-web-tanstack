import { useMediaQuery } from "@mantine/hooks";
import { useGameId } from "#/features/game/hooks/use-game-id";
import { LOCALSTORAGE_KEY_PREFIX } from "@/components/wizards/getting-started/constants/localstorage-keys";
import { GETTING_STARTED_STEPS } from "@/components/wizards/getting-started/constants/steps";
import { Wizard } from "@/features/wizard/components/Wizard";

type GettingStartedWizardProps = {
	navbarOpened: boolean;
	opened: boolean;
	onClose: () => void;
	onStepChange?: (stepId: string | null) => void;
	toggleNavbar: () => void;
};

const GettingStartedWizard = ({
	opened,
	navbarOpened,
	onStepChange,
	onClose,

	toggleNavbar,
}: GettingStartedWizardProps) => {
	const gameId = useGameId();

	const isMobile = useMediaQuery("(max-width: 768px)");

	const adaptedSteps = GETTING_STARTED_STEPS
		// On mobile, remove targetSelector for social-media step since
		// the footer is not visible with the drawer open
		.map((step) => {
			if (isMobile && step.id === "social-media") {
				return { ...step, targetSelector: undefined };
			}
			return step;
		})
		// if no gameId, remove the favorite-game slide since the
		// favorite game heart icon is not visible
		.filter((step) => {
			if (step.id === "favorite-game" && !gameId) {
				return false;
			}
			return true;
		});

	const handleBeforeOpen = () => {
		if (isMobile && !navbarOpened) {
			toggleNavbar();
		}
	};

	return (
		<Wizard
			steps={adaptedSteps}
			opened={opened}
			onClose={onClose}
			localStorageKeyPrefix={LOCALSTORAGE_KEY_PREFIX}
			onStepChange={onStepChange}
			onBeforeOpen={handleBeforeOpen}
			mobileBreakpoint={768}
		/>
	);
};

export { GettingStartedWizard };
