import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { favicons } from "favicons";
import FAVICON_REGISTRY from "./src/features/game/registry/favicon-registry.json" with {
	type: "json",
};


const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ! Deliberately hardcording to avoid injectint env vars
const CLOUDFRONT_URL = "https://d1ig3kkc8hj9hz.cloudfront.net";

async function generateForKey(key, imagePath) {
	if (!CLOUDFRONT_URL) {
		throw new Error("VITE_CLOUDFRONT_URL is not set in .env.local");
	}

	const url = `${CLOUDFRONT_URL}/${imagePath}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}
	const buffer = Buffer.from(await response.arrayBuffer());

	const result = await favicons(buffer, {
		appName: "Toolkits.gg",
		path: `/favicons/${key}/`,
		icons: {
			android: false,
			appleIcon: true,
			appleStartup: false,
			favicons: true,
			windows: false,
			yandex: false,
		},
	});

	const destDir = path.join(__dirname, "public", "favicons", key);
	await mkdir(destDir, { recursive: true });

	await Promise.all(
		[...result.images, ...result.files].map(({ name, contents }) =>
			writeFile(path.join(destDir, name), contents),
		),
	);

	console.log(`✓ Generated favicons for: ${key} (${result.images.length} images, ${result.files.length} files)`);
}

export async function generateFavicons() {
	await Promise.all(
		Object.entries(FAVICON_REGISTRY).map(([key, imagePath]) =>
			generateForKey(key, imagePath),
		),
	);
	console.log("All favicons generated.");
}

export default generateFavicons;
