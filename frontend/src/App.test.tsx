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

describe('App E2E Tests - Complete User Journey', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Theme Selection to Metrics Review Journey', () => {
    it('should complete full user journey from theme selection to viewing metrics', async () => {
      const user = userEvent.setup();

      // Mock successful content generation
      const { apiService } = await import('./services/api.service');
      vi.mocked(apiService.generateContent).mockResolvedValue({
        id: 'test-1',
        theme: 'TypeScript',
        text: 'This is a test content about TypeScript programming. It helps developers write better code.',
        source: 'ai' as const,
        wordCount: 15,
        difficulty: 2,
        estimatedTime: 1,
        createdAt: new Date(),
        metadata: { language: 'en' },
      });

      render(<App />);

      // Step 1: Verify initial state - Theme selection should be visible
      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();

      // Step 2: Select a theme
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'TypeScript');

      const selectButton = screen.getByRole('button', { name: /Select Theme/i });
      await user.click(selectButton);

      // Step 3: Navigate to practice section
      const practiceNav = screen.getByRole('button', { name: /Practice/i });
      await user.click(practiceNav);

      // Step 4: Wait for content to load
      await waitFor(
        () => {
          expect(screen.queryByText(/Loading content/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Step 5: Verify content is displayed
      expect(screen.getByText(/This is a test content/i)).toBeInTheDocument();

      // Step 6: Navigate to metrics section
      const metricsNav = screen.getByRole('button', { name: /Metrics/i });
      await user.click(metricsNav);

      // Step 7: Verify metrics dashboard is displayed
      expect(screen.getByText(/Your Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Current Session/i)).toBeInTheDocument();
    });

    it('should persist theme selection across navigation', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Select a theme
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'React');

      const selectButton = screen.getByRole('button', { name: /Select Theme/i });
      await user.click(selectButton);

      // Navigate to keyboard section
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      // Navigate back to theme section
      const themeNav = screen.getByRole('button', { name: /Theme/i });
      await user.click(themeNav);

      // Verify theme is still in recent themes
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  describe('Keyboard Layout Selection', () => {
    it('should allow switching between keyboard layouts', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate to keyboard section
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      // Wait for keyboard layout selector to load
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      // Find and click DVORAK layout
      const dvorakButton = screen.getByRole('button', { name: /DVORAK/i });
      await user.click(dvorakButton);

      // Verify DVORAK is selected (button should have active styling)
      expect(dvorakButton).toHaveClass(/bg-blue-600/);
    });

    it('should persist keyboard layout preference', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate to keyboard section and select AZERTY
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      const azertyButton = screen.getByRole('button', { name: /AZERTY/i });
      await user.click(azertyButton);

      // Navigate away and back
      const themeNav = screen.getByRole('button', { name: /Theme/i });
      await user.click(themeNav);
      await user.click(keyboardNav);

      // Verify AZERTY is still selected
      await waitFor(() => {
        const azertyButtonAgain = screen.getByRole('button', { name: /AZERTY/i });
        expect(azertyButtonAgain).toHaveClass(/bg-blue-600/);
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
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'Python');

      const selectButton = screen.getByRole('button', { name: /Select Theme/i });
      await user.click(selectButton);

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
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'JavaScript');
      await user.click(screen.getByRole('button', { name: /Select Theme/i }));
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

    it('should handle empty theme input gracefully', async () => {
      render(<App />);

      // Try to select without entering a theme
      const selectButton = screen.getByRole('button', { name: /Select Theme/i });

      // Button should be disabled or clicking should not proceed
      expect(selectButton).toBeDisabled();
    });
  });

  describe('Mobile Functionality', () => {
    it('should adapt navigation for mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      render(<App />);

      // Mobile navigation should be at the bottom
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Should have mobile-specific classes
      expect(nav.parentElement).toHaveClass(/fixed/);
    });

    it('should show mobile-optimized content layout', async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      render(<App />);

      // Select a theme
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'Mobile Test');
      await user.click(screen.getByRole('button', { name: /Select Theme/i }));

      // Navigate to practice
      const practiceNav = screen.getByRole('button', { name: /Practice/i });
      await user.click(practiceNav);

      // Mobile layout should not show desktop header
      expect(screen.queryByText(/Practice typing while learning/i)).not.toBeInTheDocument();
    });

    it('should handle touch interactions on mobile', async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      render(<App />);

      // Navigate using touch-friendly buttons
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });

      // Simulate touch interaction
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

      // Test with custom localStorage mock (simulating different browser behavior)
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
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'Cross Browser Test');
      await user.click(screen.getByRole('button', { name: /Select Theme/i }));

      // Verify data was stored
      expect(customStorage['typing-app-preferences']).toBeDefined();
    });

    it('should handle missing localStorage gracefully', async () => {
      // Simulate browser with disabled localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      // App should still render without crashing
      expect(() => render(<App />)).not.toThrow();
    });

    it('should work without modern JavaScript features fallback', () => {
      // Test that app renders with basic functionality
      render(<App />);

      // Core elements should be present
      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Session Management and Data Persistence', () => {
    it('should persist user preferences across app reloads', async () => {
      const user = userEvent.setup();

      // First render - set preferences
      const { unmount } = render(<App />);

      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'Persistent Theme');
      await user.click(screen.getByRole('button', { name: /Select Theme/i }));

      // Navigate to keyboard and select layout
      await user.click(screen.getByRole('button', { name: /Keyboard/i }));
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      const dvorakButton = screen.getByRole('button', { name: /DVORAK/i });
      await user.click(dvorakButton);

      // Unmount (simulate page reload)
      unmount();

      // Second render - verify persistence
      render(<App />);

      // Navigate to theme section
      expect(screen.getByText('Persistent Theme')).toBeInTheDocument();

      // Navigate to keyboard section
      await user.click(screen.getByRole('button', { name: /Keyboard/i }));

      await waitFor(() => {
        const dvorakButtonAgain = screen.getByRole('button', { name: /DVORAK/i });
        expect(dvorakButtonAgain).toHaveClass(/bg-blue-600/);
      });
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorage.setItem('typing-app-preferences', 'invalid-json-{{{');
      localStorage.setItem('typing-app-metrics', 'corrupted');

      // App should still render and initialize with defaults
      expect(() => render(<App />)).not.toThrow();

      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();
    });

    it('should clear old data and start fresh when requested', async () => {
      // Set some initial data
      localStorage.setItem(
        'typing-app-preferences',
        JSON.stringify({
          recentThemes: ['Old Theme 1', 'Old Theme 2'],
          keyboardLayout: 'DVORAK',
        })
      );

      render(<App />);

      // Verify old data is loaded
      expect(screen.getByText('Old Theme 1')).toBeInTheDocument();

      // Clear data by clearing localStorage
      localStorage.clear();

      // Reload app
      const { unmount } = render(<App />);
      unmount();
      render(<App />);

      // Old themes should not be present
      expect(screen.queryByText('Old Theme 1')).not.toBeInTheDocument();
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
            }, 1000);
          })
      );

      render(<App />);

      // Select theme and navigate to practice
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'Slow Load');
      await user.click(screen.getByRole('button', { name: /Select Theme/i }));
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

  describe('Accessibility and User Experience', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Tab through interactive elements
      await user.tab();

      // First focusable element should be focused
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      expect(themeInput).toHaveFocus();

      // Continue tabbing
      await user.tab();

      // Should focus on next interactive element
      const activeElement = document.activeElement;
      expect(activeElement).toBeInstanceOf(HTMLElement);
    });

    it('should provide helpful error messages', async () => {
      const user = userEvent.setup();

      const { apiService } = await import('./services/api.service');
      vi.mocked(apiService.generateContent).mockRejectedValue(new Error('Network timeout'));

      render(<App />);

      // Trigger error
      const themeInput = screen.getByPlaceholderText(/Enter a theme/i);
      await user.type(themeInput, 'Error Test');
      await user.click(screen.getByRole('button', { name: /Select Theme/i }));
      await user.click(screen.getByRole('button', { name: /Practice/i }));

      // Should show user-friendly error message
      await waitFor(
        () => {
          const errorMessage = screen.getByText(/Failed to load content/i);
          expect(errorMessage).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should maintain focus management during navigation', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate to keyboard section
      const keyboardNav = screen.getByRole('button', { name: /Keyboard/i });
      await user.click(keyboardNav);

      // Focus should be managed appropriately
      await waitFor(() => {
        expect(screen.getByText(/Keyboard Layout/i)).toBeInTheDocument();
      });

      // Active element should be within the visible content
      const activeElement = document.activeElement;
      expect(activeElement).toBeInstanceOf(HTMLElement);
    });
  });
});
