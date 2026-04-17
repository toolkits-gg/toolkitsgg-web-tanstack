import type { MantineThemeOverride } from '@mantine/core';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect } from 'react';

import { allGameConfigs } from '@/features/game/constants/all-game-configs';
import { getGameConfig } from '@/features/game/utils/get-game-config';
import { LOCALSTORAGE_KEYS } from '@/features/theme/constants/localstorage-keys';
import { useMantineThemeStore } from '@/features/theme/store/theme-store';
import { defaultTheme } from '@/features/theme/themes/default-theme';

/**
 * This function determines which Mantine theme to use based on the provided nextTheme string.
 * It checks if the nextTheme includes any game-specific class names defined in the game configurations.
 * If no matching game theme is found, it falls back to the default theme.
 */
const getMantineThemeOverride = (
  nextTheme: string | undefined
): MantineThemeOverride => {
  const gameConfig = Object.values(allGameConfigs).find((gameConfig) =>
    gameConfig.THEME?.className
      ? nextTheme?.includes(gameConfig.THEME.className)
      : undefined
  );

  if (!gameConfig || !gameConfig.THEME?.theme) {
    return defaultTheme;
  }

  return gameConfig.THEME.theme;
};

interface UseAutoChangeThemeProps {
  gameId: string | undefined;
}

/**
 * Automatically change the theme to match the game theme when the game changes.
 * Only runs if autoChangeTheme is enabled and nextTheme is set.
 * This ensures that the theme always matches the game theme,
 * even if the user has changed the theme manually before.
 */
const useAutoChangeTheme = ({ gameId }: UseAutoChangeThemeProps) => {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();

  const setMantineTheme = useMantineThemeStore((state) => state.changeTheme);

  /**
   * Watches for changes to gameId, and if autoChangeTheme is enabled and
   * nextTheme is set, it will change the theme to match the game's theme.
   *
   * ! We read autoChangeTheme directly from localStorage instead of using
   * ! useLocalStorage to avoid stale-state issues: the useLocalStorage instance
   * ! here and the one in ThemeChangerModalContent are separate, and the browser
   * ! `storage` event only fires across windows — not within the same window —
   * ! so the two instances never stay in sync reactively.
   */
  useEffect(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEYS.AUTO_CHANGE_THEME);
    const autoChangeTheme =
      stored === null ? true : JSON.parse(stored) === true;

    if (!autoChangeTheme) {
      return;
    }

    if (!nextTheme) {
      return;
    }

    const { gameConfig } = getGameConfig(gameId);

    // force change theme to match game
    let gameTheme = gameConfig?.THEME?.className;
    if (!gameTheme) {
      gameTheme = 'default';
    }

    if (gameTheme && gameTheme !== nextTheme) {
      // replace everything before the first '-' with the gameTheme
      const newNextTheme = nextTheme.replace(/^[^-]+/, gameTheme);
      setNextTheme(newNextTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  /**
   * Syncs the Mantine theme with the nextTheme. Whenever nextTheme changes,
   * it will update the Mantine theme to match the new nextTheme
   */
  useEffect(() => {
    setMantineTheme(getMantineThemeOverride(nextTheme));
  }, [nextTheme, setMantineTheme]);
};

export { useAutoChangeTheme };
