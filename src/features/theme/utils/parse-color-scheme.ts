/**
 * Parses the color scheme from the given theme string.
 * @param nextTheme - The current Next.js theme string
 * @returns The parsed color scheme ('light' or 'dark')
 */
const parseColorScheme = (nextTheme: string | undefined) => {
  if (!nextTheme) return 'dark';
  return nextTheme.includes('-light') ? 'light' : 'dark';
};

export { parseColorScheme };
