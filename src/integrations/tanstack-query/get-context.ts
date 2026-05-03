import { QueryClient } from "@tanstack/react-query";

const getContext = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				gcTime: 5 * 60_000,
				retry: (count, err) =>
					count < 2 && !(err instanceof Response && err.status === 401),
			},
		},
	});

	return {
		queryClient,
	};
};

export { getContext };
