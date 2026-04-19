import { Flex, Text } from "@mantine/core";
import type { ReactNode } from "react";

import { DEFAULT_LOGO_SIZE, type LogoSize } from "@/components/AppLogo";

type ScreenshotWatermarkProps = {
	renderLogo: (size: LogoSize) => ReactNode;
	logoSize?: LogoSize;
	label: string;
	fontSize?: string;
	gap?: number | string;
};

const ScreenshotWatermark = ({
	renderLogo,
	logoSize = DEFAULT_LOGO_SIZE,
	label,
	fontSize = "md",
	gap = 2,
}: ScreenshotWatermarkProps) => {
	return (
		<Flex align="center" justify="flex-end" w="100%" gap={gap} py={0} px="sm">
			{renderLogo(logoSize)}
			<Flex direction="column" gap={0}>
				<Text fz="lg" fw={700} c="accent" ff="heading" lh={1}>
					toolkits.gg
				</Text>
				{label !== "Default" && (
					<Text fz={fontSize} fw={600} lh={1} tt="uppercase" c="primary">
						{label}
					</Text>
				)}
			</Flex>
		</Flex>
	);
};

export { ScreenshotWatermark };
