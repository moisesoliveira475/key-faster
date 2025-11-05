import { useEffect, useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import type { ThemeSelection } from '../types';
import { sanitizeTheme, validateTheme } from '../utils/validation';

interface ThemeSelectorProps {
  onThemeSelect: (theme: string) => void;
  className?: string;
}

// Predefined theme suggestions
const THEME_SUGGESTIONS = {
  pt: [
    'História do Brasil',
    'Ciência e Tecnologia',
    'Literatura Brasileira',
    'Astronomia',
    'Biologia Marinha',
    'Física Quântica',
    'Programação',
    'Inteligência Artificial',
  ],
  en: [
    'World History',
    'Science and Technology',
    'Literature',
    'Astronomy',
    'Marine Biology',
    'Quantum Physics',
    'Programming',
    'Artificial Intelligence',
  ],
};

export function ThemeSelector({ onThemeSelect, className = '' }: ThemeSelectorProps) {
  const { recentThemes, addRecentTheme, removeRecentTheme, language } = usePreferencesStore();
  const [customTheme, setCustomTheme] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const suggestions = THEME_SUGGESTIONS[language];

  // Filter suggestions based on input
  useEffect(() => {
    if (customTheme.trim().length > 0) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(customTheme.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [customTheme, suggestions]);

  const handleThemeInputChange = (value: string) => {
    setCustomTheme(value);
    setValidationError(null);

    // Real-time validation
    if (value.length > 0) {
      const validation = validateTheme(value);
      if (!validation.valid) {
        setValidationError(validation.error || null);
      }
    }
  };

  const handleThemeSubmit = (themeName: string) => {
    const sanitized = sanitizeTheme(themeName);
    const validation = validateTheme(sanitized);

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid theme');
      return;
    }

    // Create theme selection object
    const themeSelection: ThemeSelection = {
      id: `theme-${Date.now()}`,
      name: sanitized,
      isCustom: !suggestions.includes(themeName),
      usageCount: 0,
    };

    // Add to recent themes
    addRecentTheme(themeSelection);

    // Notify parent component
    onThemeSelect(sanitized);

    // Clear input
    setCustomTheme('');
    setValidationError(null);
    setShowSuggestions(false);
  };

  const handleRecentThemeClick = (theme: ThemeSelection) => {
    addRecentTheme(theme);
    onThemeSelect(theme.name);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleThemeSubmit(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTheme.trim().length > 0) {
      e.preventDefault();
      handleThemeSubmit(customTheme);
    }
  };

  const handleRemoveTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentTheme(themeId);
  };

  const characterCount = customTheme.length;
  const characterLimit = 100;
  const isNearLimit = characterCount > 80;

  return (
    <div className={`theme-selector ${className}`}>
      {/* Custom Theme Input */}
      <div className={isMobile ? 'mb-4' : 'mb-6'}>
        <label
          htmlFor="theme-input"
          className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}
        >
          {language === 'pt' ? 'Escolha um tema para estudar' : 'Choose a theme to study'}
        </label>

        <div className="relative">
          <input
            id="theme-input"
            type="text"
            value={customTheme}
            onChange={(e) => handleThemeInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => customTheme.length > 0 && setShowSuggestions(true)}
            placeholder={
              language === 'pt' ? 'Digite um tema personalizado...' : 'Enter a custom theme...'
            }
            className={`w-full ${isMobile ? 'px-3 py-2.5 text-base' : 'px-4 py-2'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              validationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            maxLength={characterLimit}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'theme-error' : undefined}
          />

          {/* Character Counter */}
          <div
            className={`absolute right-3 top-2 text-xs ${
              isNearLimit ? 'text-orange-500 font-semibold' : 'text-gray-400'
            }`}
          >
            {characterCount}/{characterLimit}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <p id="theme-error" className="mt-2 text-sm text-red-600" role="alert">
            {validationError}
          </p>
        )}

        {/* Submit Button */}
        <button
          onClick={() => handleThemeSubmit(customTheme)}
          disabled={!customTheme.trim() || !!validationError}
          className={`mt-3 w-full ${isMobile ? 'py-3 text-base' : 'py-2'} px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation`}
        >
          {language === 'pt' ? 'Começar Prática' : 'Start Practice'}
        </button>
      </div>

      {/* Theme Suggestions */}
      <div className={isMobile ? 'mb-4' : 'mb-6'}>
        <h3
          className={`font-medium text-gray-700 dark:text-gray-300 mb-3 ${isMobile ? 'text-sm' : 'text-sm'}`}
        >
          {language === 'pt' ? 'Sugestões de Temas' : 'Theme Suggestions'}
        </h3>
        <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-2'}`}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-3 py-1.5 text-sm'} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors touch-manipulation`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Themes */}
      {recentThemes.length > 0 && (
        <div>
          <h3
            className={`font-medium text-gray-700 dark:text-gray-300 mb-3 ${isMobile ? 'text-sm' : 'text-sm'}`}
          >
            {language === 'pt' ? 'Temas Recentes' : 'Recent Themes'}
          </h3>
          <div className={isMobile ? 'space-y-2' : 'space-y-2'}>
            {recentThemes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-3'} bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all group touch-manipulation`}
              >
                <button
                  onClick={() => handleRecentThemeClick(theme)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-medium text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : ''} truncate`}
                    >
                      {theme.name}
                    </span>
                    {theme.isCustom && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full flex-shrink-0">
                        {language === 'pt' ? 'Personalizado' : 'Custom'}
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 ${isMobile ? 'flex-wrap' : ''}`}
                  >
                    <span>
                      {language === 'pt' ? 'Usado' : 'Used'} {theme.usageCount}{' '}
                      {theme.usageCount === 1
                        ? language === 'pt'
                          ? 'vez'
                          : 'time'
                        : language === 'pt'
                          ? 'vezes'
                          : 'times'}
                    </span>
                    {theme.lastUsed && !isMobile && (
                      <span>
                        {language === 'pt' ? 'Última vez:' : 'Last used:'}{' '}
                        {new Date(theme.lastUsed).toLocaleDateString(
                          language === 'pt' ? 'pt-BR' : 'en-US'
                        )}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={(e) => handleRemoveTheme(theme.id, e)}
                  className={`ml-2 ${isMobile ? 'p-2' : 'p-1.5'} text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} touch-manipulation flex-shrink-0`}
                  aria-label={language === 'pt' ? 'Remover tema' : 'Remove theme'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
