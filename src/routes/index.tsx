import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main>
			<section>
				<h1>Home Page</h1>
			</section>
		</main>
	);
}
