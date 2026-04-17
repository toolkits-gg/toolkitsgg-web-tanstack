import { allGameConfigs } from '@/features/game/constants/all-game-configs';
import { defaultTheme } from '@/features/theme/themes/default-theme';
import type { ToolkitThemeDefinition } from '@/features/theme/types/toolkit-theme-definition';

const defaultThemeDefinitions: ToolkitThemeDefinition[] = [
  {
    label: 'Default Light',
    className: 'default-light',
    theme: defaultTheme,
  },
  {
    label: 'Default Dark',
    className: 'default-dark',
    theme: defaultTheme,
  },
].sort((a, b) => a.label.localeCompare(b.label));

const gameThemeDefinitions: ToolkitThemeDefinition[] = Object.values(
  allGameConfigs
)
  .filter((gameConfig) => gameConfig.THEME !== undefined)
  .map((gameConfig) => [
    {
      label: `${gameConfig.THEME!.label} - Light`,
      className: `${gameConfig.THEME!.className}-light`,
      theme: gameConfig.THEME!.theme,
    },
    {
      label: `${gameConfig.THEME!.label} - Dark`,
      className: `${gameConfig.THEME!.className}-dark`,
      theme: gameConfig.THEME!.theme,
    },
  ])
  .flat()
  .sort((a, b) => a.label.localeCompare(b.label));

const allThemeDefinitions = [
  ...defaultThemeDefinitions,
  ...gameThemeDefinitions,
];

export { allThemeDefinitions,defaultThemeDefinitions, gameThemeDefinitions };
