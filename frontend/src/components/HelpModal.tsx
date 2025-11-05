import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help Modal Component
 * Provides user onboarding and help documentation
 */
export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'features' | 'shortcuts' | 'tips'>(
    'getting-started'
  );
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const tabs = [
    { id: 'getting-started' as const, label: 'Getting Started', icon: '🚀' },
    { id: 'features' as const, label: 'Features', icon: '✨' },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: '⌨️' },
    { id: 'tips' as const, label: 'Tips', icon: '💡' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${isMobile ? 'w-full max-h-[90vh]' : 'max-w-3xl w-full max-h-[80vh]'} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Documentation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className={isMobile ? 'text-sm' : ''}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'getting-started' && <GettingStartedContent />}
          {activeTab === 'features' && <FeaturesContent />}
          {activeTab === 'shortcuts' && <ShortcutsContent />}
          {activeTab === 'tips' && <TipsContent />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

const GettingStartedContent = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Welcome to Typing Study App! 👋
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Learn to type faster while studying topics you love. Here's how to get started:
      </p>
    </div>

    <div className="space-y-4">
      <Step
        number={1}
        title="Choose a Theme"
        description="Select a topic you're interested in learning about. You can choose from suggestions or enter your own custom theme."
      />
      <Step
        number={2}
        title="Select Keyboard Layout"
        description="Pick your keyboard layout (QWERTY, DVORAK, or AZERTY) to match your physical keyboard."
      />
      <Step
        number={3}
        title="Start Practicing"
        description="The app will generate educational content about your chosen theme. Type the text to practice while learning!"
      />
      <Step
        number={4}
        title="Track Progress"
        description="View your typing speed (WPM), accuracy, and improvement over time in the Metrics section."
      />
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <p className="text-sm text-blue-800 dark:text-blue-300">
        <strong>💡 Pro Tip:</strong> Start with topics you're familiar with to build confidence,
        then challenge yourself with new subjects!
      </p>
    </div>
  </div>
);

const FeaturesContent = () => (
  <div className="space-y-4">
    <Feature
      icon="🎯"
      title="Custom Themes"
      description="Choose any topic to study while practicing typing. The AI generates relevant educational content."
    />
    <Feature
      icon="⌨️"
      title="Multiple Keyboard Layouts"
      description="Support for QWERTY, DVORAK, and AZERTY layouts with visual keyboard preview."
    />
    <Feature
      icon="📊"
      title="Real-time Metrics"
      description="Track your WPM (words per minute), accuracy, and errors as you type."
    />
    <Feature
      icon="🎨"
      title="Error Highlighting"
      description="Visual feedback shows correct and incorrect characters to help you improve."
    />
    <Feature
      icon="⏸️"
      title="Auto-Pause"
      description="Sessions automatically pause after 10 seconds of inactivity to keep metrics accurate."
    />
    <Feature
      icon="💾"
      title="Auto-Save"
      description="Your progress is automatically saved every 30 seconds. Never lose your work!"
    />
    <Feature
      icon="📈"
      title="Progress Tracking"
      description="View your improvement over time with detailed statistics and session history."
    />
    <Feature
      icon="📱"
      title="Mobile Optimized"
      description="Fully responsive design works great on phones, tablets, and desktops."
    />
  </div>
);

const ShortcutsContent = () => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Keyboard Shortcuts
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Use these shortcuts to navigate the app more efficiently:
      </p>
    </div>

    <div className="space-y-2">
      <Shortcut keys={['Esc']} description="Pause or resume the current typing session" />
      <Shortcut keys={['Tab']} description="Navigate between sections (disabled during typing)" />
    </div>

    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">During Typing Session:</h4>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li>• Type naturally - the app captures all your keystrokes</li>
        <li>• Backspace works to correct mistakes</li>
        <li>• Progress is saved automatically</li>
        <li>• Press Esc to pause if you need a break</li>
      </ul>
    </div>
  </div>
);

const TipsContent = () => (
  <div className="space-y-4">
    <Tip
      icon="🎯"
      title="Focus on Accuracy First"
      description="Speed will come naturally with practice. Aim for 95%+ accuracy before worrying about WPM."
    />
    <Tip
      icon="👀"
      title="Look at the Screen, Not Your Hands"
      description="Touch typing is about muscle memory. Keep your eyes on the text you're typing."
    />
    <Tip
      icon="🧘"
      title="Maintain Good Posture"
      description="Sit up straight with your feet flat on the floor. Your wrists should be level with the keyboard."
    />
    <Tip
      icon="⏰"
      title="Practice Regularly"
      description="Short, daily practice sessions (15-20 minutes) are more effective than long, infrequent ones."
    />
    <Tip
      icon="🎓"
      title="Learn While You Type"
      description="Choose topics you want to learn about. You'll improve typing AND gain knowledge!"
    />
    <Tip
      icon="📊"
      title="Review Your Metrics"
      description="Check which keys or combinations cause the most errors and focus on improving those."
    />
    <Tip
      icon="🔄"
      title="Try Different Themes"
      description="Variety keeps practice interesting and exposes you to different vocabulary."
    />
    <Tip
      icon="🎮"
      title="Set Personal Goals"
      description="Challenge yourself to beat your best WPM or achieve a new accuracy record."
    />
  </div>
);

// Helper Components
const Step = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
      {number}
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const Feature = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div className="text-2xl">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const Shortcut = ({ keys, description }: { keys: string[]; description: string }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

const Tip = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="flex gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="text-2xl">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

/**
 * Help Button Component
 * Floating button to open help modal
 */
export const HelpButton = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <button
        onClick={() => setIsHelpOpen(true)}
        className={`fixed ${isMobile ? 'bottom-24 right-4' : 'bottom-6 right-6'} bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-40 ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}
        aria-label="Open help"
        title="Help & Documentation"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};
