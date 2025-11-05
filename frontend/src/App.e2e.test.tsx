import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

// Mock the API service
vi.mock('./services/api.service', () => ({
  apiService: {
    generateContent: vi.fn(),
    fetchWikipediaContent: vi.fn(),
  },
}));

describe('E2E Tests - Complete User Journey', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Set desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Theme Selection to Practice Journey', () => {
    it('should allow user to select a theme and navigate to practice', async () => {
      const user = userEvent.setup();

      // Mock successful content generation
      const { apiService } = await import('./services/api.service');
      vi.mocked(apiService.generateContent).mockResolvedValue({
        id: 'test-1',
        theme: 'TypeScript',
        text: 'This is test content about TypeScript programming.',
        source: 'ai' as const,
        wordCount: 8,
        difficulty: 2,
        estimatedTime: 1,
        createdAt: new Date(),
        metadata: { language: 'en' },
      });

      render(<App />);

      // Verify initial state
      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();

      // Enter a custom theme
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'TypeScript');

      // Click start practice button
      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await user.click(startButton);

      // Navigate to practice section
      const practiceNav = screen.getByRole('button', { name: /Practice/i });
      await user.click(practiceNav);

      // Verify content loads
      await waitFor(
        () => {
          expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should persist selected theme in recent themes', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Select a theme
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'React Hooks');

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await user.click(startButton);

      // Navigate away and back
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      const themeNav = screen.getByRole('button', { name: /Theme/i });
      await user.click(themeNav);

      // Verify theme appears in recent themes
      expect(screen.getByText('React Hooks')).toBeInTheDocument();
    });
  });

  describe('Keyboard Layout Selection', () => {
    it('should allow switching between keyboard layouts', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate to keyboard section
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      // Wait for keyboard layout selector
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      // Find DVORAK button
      const dvorakButton = screen.getByRole('button', { name: /Select Dvorak keyboard layout/i });
      await user.click(dvorakButton);

      // Verify selection (button should be pressed)
      expect(dvorakButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should persist keyboard layout preference', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Select AZERTY layout
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      const azertyButton = screen.getByRole('button', { name: /Select AZERTY keyboard layout/i });
      await user.click(azertyButton);

      // Unmount and remount
      const { unmount } = render(<App />);
      unmount();
      render(<App />);

      // Navigate back to keyboard section
      await user.click(screen.getByRole('button', { name: /Keyboard/i }));

      // Verify AZERTY is still selected
      await waitFor(() => {
        const azertyButtonAgain = screen.getByRole('button', {
          name: /Select AZERTY keyboard layout/i,
        });
        expect(azertyButtonAgain).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Error Scenarios and Recovery', () => {
    it('should handle content generation failure gracefully', async () => {
      const user = userEvent.setup();

      // Mock failed content generation
      const { apiService } = await import('./services/api.service');
      vi.mocked(apiService.generateContent).mockRejectedValue(new Error('API Error'));

      render(<App />);

      // Select a theme
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'Python');

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await user.click(startButton);

      // Navigate to practice
      const practiceNav = screen.getByRole('button', { name: /Practice/i });
      await user.click(practiceNav);

      // Wait for error message
      await waitFor(
        () => {
          expect(screen.getByText(/Failed to load content/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify retry button is available
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    it('should recover from error with retry', async () => {
      const user = userEvent.setup();

      const { apiService } = await import('./services/api.service');

      // First call fails, second succeeds
      vi.mocked(apiService.generateContent)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          id: 'test-2',
          theme: 'JavaScript',
          text: 'Recovered content about JavaScript.',
          source: 'ai' as const,
          wordCount: 5,
          difficulty: 1,
          estimatedTime: 1,
          createdAt: new Date(),
          metadata: { language: 'en' },
        });

      render(<App />);

      // Select theme and navigate to practice
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'JavaScript');
      await user.click(screen.getByRole('button', { name: /Start Practice/i }));
      await user.click(screen.getByRole('button', { name: /Practice/i }));

      // Wait for error
      await waitFor(
        () => {
          expect(screen.getByText(/Failed to load content/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click retry
      const retryButton = screen.getByRole('button', { name: /Retry/i });
      await user.click(retryButton);

      // Wait for successful content load
      await waitFor(
        () => {
          expect(screen.getByText(/Recovered content about JavaScript/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should disable start button when theme input is empty', async () => {
      render(<App />);

      // Button should be disabled with empty input
      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('Mobile Functionality', () => {
    it('should adapt layout for mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      render(<App />);

      // Navigation should be present
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should handle navigation on mobile', async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      render(<App />);

      // Navigate to keyboard section
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      // Should navigate successfully
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work with different localStorage implementations', async () => {
      const user = userEvent.setup();

      // Custom localStorage implementation
      const customStorage: Record<string, string> = {};
      const customLocalStorage = {
        getItem: (key: string) => customStorage[key] || null,
        setItem: (key: string, value: string) => {
          customStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete customStorage[key];
        },
        clear: () => {
          Object.keys(customStorage).forEach((key) => delete customStorage[key]);
        },
        length: 0,
        key: () => null,
      };

      Object.defineProperty(window, 'localStorage', {
        value: customLocalStorage,
        writable: true,
      });

      render(<App />);

      // Select a theme
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'Cross Browser Test');
      await user.click(screen.getByRole('button', { name: /Start Practice/i }));

      // Verify data was stored
      expect(customStorage['typing-app-preferences']).toBeDefined();
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data
      localStorage.setItem('typing-app-preferences', 'invalid-json-{{{');
      localStorage.setItem('typing-app-metrics', 'corrupted');

      // App should still render
      expect(() => render(<App />)).not.toThrow();
      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();
    });
  });

  describe('Session Management and Data Persistence', () => {
    it('should persist user preferences across app reloads', async () => {
      const user = userEvent.setup();

      // First render - set preferences
      const { unmount } = render(<App />);

      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'Persistent Theme');
      await user.click(screen.getByRole('button', { name: /Start Practice/i }));

      // Navigate to keyboard and select layout
      await user.click(screen.getByRole('button', { name: /Keyboard/i }));
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      const dvorakButton = screen.getByRole('button', { name: /Select Dvorak keyboard layout/i });
      await user.click(dvorakButton);

      // Unmount (simulate page reload)
      unmount();

      // Second render - verify persistence
      render(<App />);

      // Check theme persisted
      expect(screen.getByText('Persistent Theme')).toBeInTheDocument();

      // Check keyboard layout persisted
      await user.click(screen.getByRole('button', { name: /Keyboard/i }));

      await waitFor(() => {
        const dvorakButtonAgain = screen.getByRole('button', {
          name: /Select Dvorak keyboard layout/i,
        });
        expect(dvorakButtonAgain).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during content fetch', async () => {
      const user = userEvent.setup();

      // Mock slow API response
      const { apiService } = await import('./services/api.service');
      vi.mocked(apiService.generateContent).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                id: 'test-3',
                theme: 'Slow Load',
                text: 'Delayed content',
                source: 'ai' as const,
                wordCount: 2,
                difficulty: 1,
                estimatedTime: 1,
                createdAt: new Date(),
                metadata: { language: 'en' },
              });
            }, 500);
          })
      );

      render(<App />);

      // Select theme and navigate to practice
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'Slow Load');
      await user.click(screen.getByRole('button', { name: /Start Practice/i }));
      await user.click(screen.getByRole('button', { name: /Practice/i }));

      // Should show loading indicator
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();

      // Wait for content to load
      await waitFor(
        () => {
          expect(screen.getByText(/Delayed content/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should handle rapid navigation without breaking', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Rapidly navigate between sections
      const themeNav = screen.getByRole('button', { name: /Theme/i });
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      const practiceNav = screen.getByRole('button', { name: /Practice/i });
      const metricsNav = screen.getByRole('button', { name: /Metrics/i });

      // Click multiple times rapidly
      await user.click(keyboardNav);
      await user.click(practiceNav);
      await user.click(metricsNav);
      await user.click(themeNav);
      await user.click(keyboardNav);

      // App should still be functional
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Tab to first interactive element
      await user.tab();

      // Theme input should be focused
      const themeInput = screen.getByRole('textbox');
      expect(themeInput).toHaveFocus();
    });

    it('should provide helpful error messages', async () => {
      const user = userEvent.setup();

      const { apiService } = await import('./services/api.service');
      vi.mocked(apiService.generateContent).mockRejectedValue(new Error('Network timeout'));

      render(<App />);

      // Trigger error
      const themeInput = screen.getByRole('textbox');
      await user.type(themeInput, 'Error Test');
      await user.click(screen.getByRole('button', { name: /Start Practice/i }));
      await user.click(screen.getByRole('button', { name: /Practice/i }));

      // Should show user-friendly error message
      await waitFor(
        () => {
          expect(screen.getByText(/Failed to load content/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
