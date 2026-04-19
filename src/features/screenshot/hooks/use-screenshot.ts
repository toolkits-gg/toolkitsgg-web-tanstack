import { useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { domToBlob } from "modern-screenshot";
import { useRef } from "react";
import { useScreenshotPreviewStore } from "#/features/screenshot/store/screenshot-preview-store";
import { logger } from "#/integrations/pino/logger";

type ScreenshotResult = {
	screenshot: string | null;
	triggerScreenshot: () => void;
	clearScreenshot: () => void;
	saveScreenshot: () => void;
	copyScreenshot: () => Promise<void>;
	screenshotLoading: boolean;
	error: string | null;
};

type UseScreenshotProps = {
	ref?: React.RefObject<HTMLElement | null>;
	filename?: string;
	previewRef?: React.RefObject<{ open: () => void } | null>;
};

function useScreenshot({
	ref,
	filename,
}: UseScreenshotProps): ScreenshotResult {
	const {
		screenshot,
		screenshotLoading,
		setScreenshotLoading,
		setError,
		setScreenshot,
		openPreview,
		clearPreview,
		error,
	} = useScreenshotPreviewStore();
	const screenshotRef = useRef(ref);

	const { colorScheme } = useMantineColorScheme();
	const mantineTheme = useMantineTheme();

	const triggerScreenshot = () => {
		const element = screenshotRef.current?.current;

		if (element) {
			openPreview({
				screenshot: null,
				screenshotLoading: true,
				error: null,
				title: filename || "Screenshot Preview",
			});

			setTimeout(async () => {
				setScreenshotLoading(true);
				setError(null);

				try {
					const blob = await domToBlob(element, {
						backgroundColor:
							colorScheme === "dark"
								? mantineTheme.colors.base[5]
								: mantineTheme.colors.base[5],
						quality: 1,
					});

					if (blob) {
						setScreenshot(URL.createObjectURL(blob));
					} else {
						setError("Failed to capture screenshot.");
						setScreenshot(null);
						return;
					}
				} catch (error) {
					logger.error({ err: error }, "Screenshot error");
					setError(
						`Failed to capture screenshot: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				} finally {
					setScreenshotLoading(false);
				}
			}, 500);
		} else {
			setError("Element not found");
			setScreenshotLoading(false);
		}
	};

	const clearScreenshot = () => {
		clearPreview();
		setError(null);
		setScreenshot(null);
	};

	const saveScreenshot = () => {
		if (!screenshot) return;

		const link = document.createElement("a");
		link.href = screenshot;
		link.download = filename || "screenshot.png";
		link.click();
	};

	const copyScreenshot = async () => {
		if (!screenshot) return;

		try {
			const res = await fetch(screenshot);
			const blob = await res.blob();
			await navigator.clipboard.write([
				new window.ClipboardItem({ "image/png": blob }),
			]);
		} catch {
			setError("Failed to copy screenshot");
		}
	};

	return {
		screenshot,
		triggerScreenshot,
		clearScreenshot,
		saveScreenshot,
		copyScreenshot,
		screenshotLoading,
		error,
	};
}

export { type ScreenshotResult, useScreenshot };
