import type { MantineThemeOverride } from '@mantine/core';
import { create, type StateCreator } from 'zustand';

import { defaultTheme } from '@/features/theme/themes/default-theme';

type ThemeSlice = {
  theme: MantineThemeOverride;
  changeTheme: (newTheme: MantineThemeOverride) => void;
};

const themeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set) => ({
  theme: defaultTheme,
  changeTheme: (newTheme: MantineThemeOverride) => set({ theme: newTheme }),
});

const useMantineThemeStore = create<ThemeSlice>()((...a) => ({
  ...themeSlice(...a),
}));

export { useMantineThemeStore };
