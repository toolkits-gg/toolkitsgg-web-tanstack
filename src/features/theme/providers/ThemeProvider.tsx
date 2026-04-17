'use client';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { DEFAULT_NEXT_THEME } from '@/features/theme/constants/default-next-theme';
import { allThemeClassNames } from '@/features/theme/constants/theme-class-names';
import { useMantineThemeStore } from '@/features/theme/store/theme-store';

type ThemeProviderProps = React.PropsWithChildren;

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const mantineTheme = useMantineThemeStore((state) => state.theme);

  return (
    <NextThemesProvider
      {...props}
      enableSystem
      enableColorScheme={false} // not playing nice with the extra themes
      defaultTheme={DEFAULT_NEXT_THEME}
      disableTransitionOnChange
      themes={allThemeClassNames}
    >
      <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
        <ModalsProvider>{children}</ModalsProvider>
      </MantineProvider>
    </NextThemesProvider>
  );
};

export { ThemeProvider };
