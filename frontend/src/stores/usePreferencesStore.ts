import { create } from 'zustand';
import type { KeyboardLayoutType, ThemeSelection, UserPreferences } from '../types';

interface PreferencesState extends UserPreferences {
  // Actions
  setKeyboardLayout: (layout: KeyboardLayoutType) => void;
  addRecentTheme: (theme: ThemeSelection) => void;
  removeRecentTheme: (themeId: string) => void;
  clearRecentThemes: () => void;
  setHighlightErrors: (highlight: boolean) => void;
  setAutoPause: (enabled: boolean) => void;
  setAutoPauseDelay: (delay: number) => void;
  setLanguage: (language: 'pt' | 'en') => void;
  resetPreferences: () => void;

  // Import/Export
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;

  // Bulk updates
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  keyboardLayout: 'QWERTY',
  recentThemes: [],
  highlightErrors: true,
  autoPause: true,
  autoPauseDelay: 10,
  language: 'pt',
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...defaultPreferences,

  setKeyboardLayout: (layout) => {
    set({ keyboardLayout: layout });
  },

  addRecentTheme: (theme) => {
    const { recentThemes } = get();

    // Check if theme already exists
    const existingIndex = recentThemes.findIndex((t) => t.id === theme.id);

    let updatedThemes: ThemeSelection[];

    if (existingIndex !== -1) {
      // Update existing theme
      updatedThemes = [...recentThemes];
      updatedThemes[existingIndex] = {
        ...theme,
        lastUsed: new Date(),
        usageCount: updatedThemes[existingIndex].usageCount + 1,
      };
      // Move to front
      const [updated] = updatedThemes.splice(existingIndex, 1);
      updatedThemes.unshift(updated);
    } else {
      // Add new theme at the beginning
      updatedThemes = [
        {
          ...theme,
          lastUsed: new Date(),
          usageCount: 1,
        },
        ...recentThemes,
      ];
    }

    // Keep only the 10 most recent themes
    updatedThemes = updatedThemes.slice(0, 10);

    set({ recentThemes: updatedThemes });
  },

  removeRecentTheme: (themeId) => {
    const { recentThemes } = get();
    set({
      recentThemes: recentThemes.filter((t) => t.id !== themeId),
    });
  },

  clearRecentThemes: () => {
    set({ recentThemes: [] });
  },

  setHighlightErrors: (highlight) => {
    set({ highlightErrors: highlight });
  },

  setAutoPause: (enabled) => {
    set({ autoPause: enabled });
  },

  setAutoPauseDelay: (delay) => {
    set({ autoPauseDelay: delay });
  },

  setLanguage: (language) => {
    set({ language });
  },

  resetPreferences: () => {
    set(defaultPreferences);
  },

  exportPreferences: () => {
    const state = get();
    const exportData = {
      keyboardLayout: state.keyboardLayout,
      recentThemes: state.recentThemes,
      highlightErrors: state.highlightErrors,
      autoPause: state.autoPause,
      autoPauseDelay: state.autoPauseDelay,
      language: state.language,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  },

  importPreferences: (data: string) => {
    try {
      const importData = JSON.parse(data);

      // Validate the data structure
      if (!importData || typeof importData !== 'object') {
        console.error('Invalid import data format');
        return false;
      }

      // Convert date strings back to Date objects for themes
      if (importData.recentThemes) {
        importData.recentThemes = importData.recentThemes.map((theme: any) => ({
          ...theme,
          lastUsed: theme.lastUsed ? new Date(theme.lastUsed) : undefined,
        }));
      }

      // Apply imported preferences
      set({
        keyboardLayout: importData.keyboardLayout || defaultPreferences.keyboardLayout,
        recentThemes: importData.recentThemes || defaultPreferences.recentThemes,
        highlightErrors: importData.highlightErrors ?? defaultPreferences.highlightErrors,
        autoPause: importData.autoPause ?? defaultPreferences.autoPause,
        autoPauseDelay: importData.autoPauseDelay || defaultPreferences.autoPauseDelay,
        language: importData.language || defaultPreferences.language,
      });

      console.log('Preferences imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  },

  updatePreferences: (preferences) => {
    set((state) => ({
      ...state,
      ...preferences,
    }));
  },
}));
