import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";
import { GameProvider } from "#/features/game/core/GameProvider";
import { ScreenshotPreviewProvider } from "#/features/screenshot/core/ScreenshotPreviewProvider";
import { MantineProviderWithTheme } from "#/features/theme/core/MantineProviderWithTheme";

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
