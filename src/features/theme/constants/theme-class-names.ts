import { allThemeDefinitions } from '@/features/theme/constants/theme-definitions';

const allThemeClassNames = allThemeDefinitions
  .map((def) => def.className)
  .sort();

export { allThemeClassNames };
