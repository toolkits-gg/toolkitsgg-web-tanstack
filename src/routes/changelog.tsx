import { Container } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import changelogContent from "../../CHANGELOG.md?raw";

export const Route = createFileRoute("/changelog")({
	component: ChangelogPage,
});

function ChangelogPage() {
	return (
		<Container>
			<ReactMarkdown>{changelogContent}</ReactMarkdown>
		</Container>
	);
}
