import { lazy, Suspense, useEffect, useState } from 'react';
import './App.css';
import {
  ErrorBoundary,
  HelpButton,
  LoadingSpinner,
  SectionErrorBoundary,
  ThemeSelector,
} from './components';
import { ResponsiveCard } from './components/ResponsiveContainer';
import { ResponsiveNav } from './components/ResponsiveNav';
import { useIsMobile } from './hooks/useMediaQuery';
import { initializeStores, usePersistence } from './stores/persistence';

// Lazy load heavy components for better initial load performance
const ContentManager = lazy(() =>
  import('./components/ContentManager').then((m) => ({ default: m.ContentManager }))
);
const KeyboardLayoutSelector = lazy(() =>
  import('./components/KeyboardLayoutSelector').then((m) => ({ default: m.KeyboardLayoutSelector }))
);
const MetricsDashboard = lazy(() =>
  import('./components/MetricsDashboard').then((m) => ({ default: m.MetricsDashboard }))
);

// Loading fallback component
const ComponentLoader = () => <LoadingSpinner className="py-8" />;

function App() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [showTypingInterface, setShowTypingInterface] = useState(false);
  const [currentSection, setCurrentSection] = useState('theme');
  const isMobile = useIsMobile();

  // Initialize stores on mount
  useEffect(() => {
    initializeStores();
  }, []);

  // Set up automatic persistence
  usePersistence();

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setShowTypingInterface(false);
    if (isMobile) {
      setCurrentSection('practice');
    }
    console.log('Selected theme:', theme);
  };

  const handleStartTyping = () => {
    setShowTypingInterface(true);
    console.log('Starting typing session');
    // TODO: Integrate with TypingInterface component
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
        {/* Navigation */}
        <ResponsiveNav onNavigate={handleNavigate} currentSection={currentSection} />

        {/* Main Content */}
        <div className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
          {/* Header - Desktop only */}
          {!isMobile && (
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Typing Study App
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Practice typing while learning about topics you love
              </p>
            </header>
          )}

          {/* Content Area */}
          <div className={`${isMobile ? 'px-4 py-4' : 'p-6'} space-y-4 md:space-y-6`}>
            {/* Theme Selection Section */}
            {currentSection === 'theme' && (
              <ResponsiveCard title={isMobile ? undefined : 'Choose Your Theme'}>
                <SectionErrorBoundary section="Theme Selection">
                  <ThemeSelector onThemeSelect={handleThemeSelect} />
                </SectionErrorBoundary>
              </ResponsiveCard>
            )}

            {/* Keyboard Layout Section */}
            {currentSection === 'keyboard' && (
              <ResponsiveCard title={isMobile ? undefined : 'Keyboard Layout'}>
                <SectionErrorBoundary section="Keyboard Layout">
                  <Suspense fallback={<ComponentLoader />}>
                    <KeyboardLayoutSelector showPreview={!isMobile} />
                  </Suspense>
                </SectionErrorBoundary>
              </ResponsiveCard>
            )}

            {/* Practice Section */}
            {currentSection === 'practice' && (
              <>
                {selectedTheme && !showTypingInterface && (
                  <ResponsiveCard title={isMobile ? undefined : 'Practice Content'}>
                    <SectionErrorBoundary section="Content">
                      <Suspense fallback={<ComponentLoader />}>
                        <ContentManager
                          theme={selectedTheme}
                          onStartTyping={handleStartTyping}
                          autoFetch={true}
                        />
                      </Suspense>
                    </SectionErrorBoundary>
                  </ResponsiveCard>
                )}

                {!selectedTheme && (
                  <ResponsiveCard>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🎯</div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Select a theme to start practicing
                      </p>
                      <button
                        onClick={() => setCurrentSection('theme')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Choose Theme
                      </button>
                    </div>
                  </ResponsiveCard>
                )}

                {showTypingInterface && (
                  <ResponsiveCard>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <p className="text-blue-800 dark:text-blue-300">
                        <strong>Typing Interface:</strong> Integration with TypingInterface
                        component will be completed in future tasks
                      </p>
                      <button
                        onClick={() => setShowTypingInterface(false)}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Back to Content
                      </button>
                    </div>
                  </ResponsiveCard>
                )}
              </>
            )}

            {/* Metrics Section */}
            {currentSection === 'metrics' && (
              <ResponsiveCard title={isMobile ? undefined : 'Your Progress'}>
                <SectionErrorBoundary section="Metrics">
                  <Suspense fallback={<ComponentLoader />}>
                    <MetricsDashboard />
                  </Suspense>
                </SectionErrorBoundary>
              </ResponsiveCard>
            )}
          </div>

          {/* Help Button */}
          <HelpButton />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
