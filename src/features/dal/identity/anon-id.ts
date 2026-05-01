const STORAGE_KEY = "toolkitsgg.anonUserId";

const getOrCreateAnonUserId = (): string => {
	if (typeof window === "undefined") return "";
	let id = window.localStorage.getItem(STORAGE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		window.localStorage.setItem(STORAGE_KEY, id);
	}
	return id;
};

const clearAnonUserId = (): void => {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(STORAGE_KEY);
};

export { getOrCreateAnonUserId, clearAnonUserId };
