import { ImageKitProvider } from "@imagekit/react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";
import { GameProvider } from "#/features/game/core/GameProvider";
import { ScreenshotPreviewProvider } from "#/features/screenshot/core/ScreenshotPreviewProvider";
import { MantineProviderWithTheme } from "#/features/theme/core/MantineProviderWithTheme";

const AppProviders = ({ children }: PropsWithChildren) => {
	return (
		<NuqsAdapter>
			<GameProvider>
				<ImageKitProvider
					urlEndpoint={import.meta.env.VITE_IMAGEKIT_ENDPOINT_URL}
				>
					<MantineProviderWithTheme>
						<ScreenshotPreviewProvider />
						{children}
					</MantineProviderWithTheme>
				</ImageKitProvider>
			</GameProvider>
		</NuqsAdapter>
	);
};

export { AppProviders };
