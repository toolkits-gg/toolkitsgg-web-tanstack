import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";
import { GameProvider } from "#/features/game/components/GameProvider";
import { ScreenshotPreviewProvider } from "#/features/screenshot/providers/ScreenshotPreviewProvider";
import { MantineProviderWithTheme } from "#/features/theme/providers/MantineProviderWithTheme";

const AppProviders = ({ children }: PropsWithChildren) => {
	return (
		<NuqsAdapter>
			<GameProvider>
				<MantineProviderWithTheme>
					<ScreenshotPreviewProvider />
					{children}
				</MantineProviderWithTheme>
			</GameProvider>
		</NuqsAdapter>
	);
};

export { AppProviders };
