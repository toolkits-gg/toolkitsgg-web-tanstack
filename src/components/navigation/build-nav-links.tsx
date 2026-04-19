import { LuBadgeHelp } from "react-icons/lu";

type NavLinkSubLink = {
	label: string;
	link?: string;
	onClick?: () => void;
	dataWizardTarget?: string;
};

type NavLinkBase = {
	label: string;
	icon: React.FC | undefined;
	initiallyOpened: boolean;
	links?: NavLinkSubLink[];
};

type NavLink = NavLinkBase &
	(
		| { url: string; links?: undefined }
		| { url?: undefined; links: NavLinkSubLink[] }
	);

const buildHelpNavLink = (onGetStarted?: () => void): NavLink => ({
	label: "Help",
	icon: LuBadgeHelp,
	initiallyOpened: true,
	links: [
		{
			label: "Getting Started",
			onClick: onGetStarted,
			dataWizardTarget: "get-started-link",
		},
		{
			label: "Support Toolkits.gg",
			link: "#",
			dataWizardTarget: "support-link",
		},
	],
});

const buildNavLinks = (onGetStarted?: () => void): NavLink[] => {
	const navLinks: NavLink[] = [];

	// TODO Add game specific links here

	// * --- Navigation for Help related pages --- * //
	navLinks.push(buildHelpNavLink(onGetStarted));

	return navLinks;
};

export { buildNavLinks };
