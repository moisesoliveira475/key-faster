import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { ThemeSelector } from './ThemeSelector';

// Mock the useIsMobile hook
vi.mock('../hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}));

describe('ThemeSelector', () => {
  const mockOnThemeSelect = vi.fn();

  beforeEach(() => {
    // Reset store state before each test
    usePreferencesStore.getState().resetPreferences();
    usePreferencesStore.getState().clearRecentThemes();
    mockOnThemeSelect.mockClear();
  });

  describe('Theme Validation', () => {
    it('should accept valid theme input', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'História do Brasil');

      expect(input).toHaveValue('História do Brasil');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show validation error for empty theme', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      const submitButton = screen.getByRole('button', { name: /Começar Prática/i });

      await user.type(input, '   ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(mockOnThemeSelect).not.toHaveBeenCalled();
    });

    it('should enforce 100 character limit', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(
        /Digite um tema personalizado/i
      ) as HTMLInputElement;
      const longText = 'a'.repeat(150);

      await user.type(input, longText);

      expect(input.value.length).toBeLessThanOrEqual(100);
    });

    it('should show character counter', () => {
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('should update character counter as user types', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Test');

      expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('should accept Portuguese characters', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Programação em Python');

      expect(input).toHaveValue('Programação em Python');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show validation error for invalid characters', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Test@#$%');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Selection', () => {
    it('should call onThemeSelect when valid theme is submitted', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      const submitButton = screen.getByRole('button', { name: /Começar Prática/i });

      await user.type(input, 'História do Brasil');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnThemeSelect).toHaveBeenCalledWith('História do Brasil');
      });
    });

    it('should submit theme on Enter key press', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Ciência{Enter}');

      await waitFor(() => {
        expect(mockOnThemeSelect).toHaveBeenCalledWith('Ciência');
      });
    });

    it('should clear input after successful submission', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Test Theme');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should select predefined theme suggestion', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const suggestionButton = screen.getByRole('button', { name: /História do Brasil/i });
      await user.click(suggestionButton);

      expect(mockOnThemeSelect).toHaveBeenCalledWith('História do Brasil');
    });

    it('should disable submit button when input is empty', () => {
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const submitButton = screen.getByRole('button', { name: /Começar Prática/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when validation error exists', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, '@@@');

      const submitButton = screen.getByRole('button', { name: /Começar Prática/i });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Local Storage Integration - Recent Themes', () => {
    it('should add theme to recent themes after selection', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Test Theme');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        const recentThemes = usePreferencesStore.getState().recentThemes;
        expect(recentThemes).toHaveLength(1);
        expect(recentThemes[0].name).toBe('Test Theme');
      });
    });

    it('should display recent themes list', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      // Add a theme
      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Recent Theme');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        expect(screen.getByText('Temas Recentes')).toBeInTheDocument();
        expect(screen.getByText('Recent Theme')).toBeInTheDocument();
      });
    });

    it('should increment usage count when theme is reused', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      // Add theme first time
      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Reused Theme');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        expect(screen.getByText(/Usado 1 vez/i)).toBeInTheDocument();
      });

      // Click the recent theme to reuse it
      const recentThemeButton = screen.getByText('Reused Theme');
      await user.click(recentThemeButton);

      await waitFor(() => {
        expect(screen.getByText(/Usado 2 vezes/i)).toBeInTheDocument();
      });
    });

    it('should remove theme from recent themes', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      // Add a theme
      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Theme to Remove');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        expect(screen.getByText('Theme to Remove')).toBeInTheDocument();
      });

      // Remove the theme
      const removeButton = screen.getByLabelText(/Remover tema/i);
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('Theme to Remove')).not.toBeInTheDocument();
      });
    });

    it('should mark custom themes with badge', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'My Custom Theme');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument();
      });
    });

    it('should not show custom badge for predefined themes', async () => {
      const user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      const suggestionButton = screen.getByRole('button', { name: /História do Brasil/i });
      await user.click(suggestionButton);

      await waitFor(() => {
        const recentThemes = usePreferencesStore.getState().recentThemes;
        expect(recentThemes[0].isCustom).toBe(false);
      });
    });

    it('should limit recent themes to 10 items', async () => {
      const _user = userEvent.setup();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      // Add 12 themes directly to the store (faster than typing)
      for (let i = 1; i <= 12; i++) {
        usePreferencesStore.getState().addRecentTheme({
          id: `theme-${i}`,
          name: `Theme ${i}`,
          isCustom: true,
          usageCount: 0,
        });
      }

      const recentThemes = usePreferencesStore.getState().recentThemes;
      expect(recentThemes).toHaveLength(10);
      // Most recent should be Theme 12
      expect(recentThemes[0].name).toBe('Theme 12');
      // Theme 1 and 2 should be removed
      expect(recentThemes.find((t) => t.name === 'Theme 1')).toBeUndefined();
      expect(recentThemes.find((t) => t.name === 'Theme 2')).toBeUndefined();
    }, 10000);

    it('should persist recent themes across component remounts', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      // Add a theme
      const input = screen.getByPlaceholderText(/Digite um tema personalizado/i);
      await user.type(input, 'Persistent Theme');
      await user.click(screen.getByRole('button', { name: /Começar Prática/i }));

      await waitFor(() => {
        const recentThemes = usePreferencesStore.getState().recentThemes;
        expect(recentThemes.some((t) => t.name === 'Persistent Theme')).toBe(true);
      });

      // Unmount and remount
      unmount();
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      // Theme should still be in the store and displayed
      await waitFor(() => {
        expect(screen.getByText('Persistent Theme')).toBeInTheDocument();
      });
    });
  });

  describe('Language Support', () => {
    it('should display Portuguese labels when language is pt', () => {
      usePreferencesStore.getState().setLanguage('pt');
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      expect(screen.getByText('Escolha um tema para estudar')).toBeInTheDocument();
      expect(screen.getByText('Sugestões de Temas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Começar Prática/i })).toBeInTheDocument();
    });

    it('should display English labels when language is en', () => {
      usePreferencesStore.getState().setLanguage('en');
      render(<ThemeSelector onThemeSelect={mockOnThemeSelect} />);

      expect(screen.getByText('Choose a theme to study')).toBeInTheDocument();
      expect(screen.getByText('Theme Suggestions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Practice/i })).toBeInTheDocument();
    });
  });
});
