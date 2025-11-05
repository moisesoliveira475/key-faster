import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useTypingMetrics } from '../hooks/useTypingMetrics';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { useTypingSessionStore } from '../stores/useTypingSessionStore';
import type { TypingError } from '../types';

interface TypingInterfaceProps {
  content: string;
  onSessionComplete?: () => void;
}

export const TypingInterface = memo(({ content, onSessionComplete }: TypingInterfaceProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState('');
  const isMobile = useIsMobile();

  const {
    currentSession,
    isSessionActive,
    isPaused,
    updateProgress,
    addError,
    pauseSession,
    resumeSession,
  } = useTypingSessionStore();

  const { highlightErrors } = usePreferencesStore();
  const { recordKeystroke } = useTypingMetrics();

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current && isSessionActive) {
      inputRef.current.focus();
    }
  }, [isSessionActive]);

  // Handle input changes - memoized for performance
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isSessionActive || isPaused) return;

      const newInput = e.target.value;
      const position = newInput.length;

      // Record keystroke for metrics and auto-pause
      recordKeystroke();

      // Check if the last character is correct
      if (newInput.length > userInput.length) {
        const lastTypedChar = newInput[newInput.length - 1];
        const expectedChar = content[newInput.length - 1];

        if (lastTypedChar !== expectedChar) {
          const error: TypingError = {
            position: newInput.length - 1,
            expectedChar,
            typedChar: lastTypedChar,
            timestamp: new Date(),
            corrected: false,
          };
          addError(error);
        }
      }

      setUserInput(newInput);
      updateProgress(position, newInput);

      // Check if session is complete
      if (newInput.length === content.length) {
        onSessionComplete?.();
      }
    },
    [
      isSessionActive,
      isPaused,
      userInput.length,
      content,
      recordKeystroke,
      addError,
      updateProgress,
      onSessionComplete,
    ]
  );

  // Handle keyboard events for special keys - memoized
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Prevent default behavior for certain keys
      if (e.key === 'Tab') {
        e.preventDefault();
      }

      // Handle pause/resume with Escape key
      if (e.key === 'Escape') {
        if (isPaused) {
          resumeSession();
        } else {
          pauseSession();
        }
      }
    },
    [isPaused, resumeSession, pauseSession]
  );

  // Render character with appropriate styling - memoized
  const renderCharacter = useCallback(
    (char: string, index: number) => {
      const isTyped = index < userInput.length;
      const isCorrect = isTyped && userInput[index] === char;
      const isIncorrect = isTyped && userInput[index] !== char;
      const isCurrent = index === userInput.length;

      let className = 'inline-block ';

      if (isCurrent) {
        className += 'bg-blue-200 dark:bg-blue-800 ';
      } else if (isCorrect) {
        className += 'text-green-600 dark:text-green-400 ';
      } else if (isIncorrect && highlightErrors) {
        className += 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 ';
      } else if (!isTyped) {
        className += 'text-gray-600 dark:text-gray-400 ';
      }

      // Handle special characters
      const displayChar = char === ' ' ? '\u00A0' : char === '\n' ? '↵' : char;

      return (
        <span key={index} className={className}>
          {displayChar}
        </span>
      );
    },
    [userInput, highlightErrors]
  );

  // Memoize the rendered content to avoid re-rendering all characters on every keystroke
  const renderedContent = useMemo(() => {
    return content.split('').map((char, index) => renderCharacter(char, index));
  }, [content, renderCharacter]);

  if (!isSessionActive) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Start a session to begin typing practice
      </div>
    );
  }

  const progress = (userInput.length / content.length) * 100;

  return (
    <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
      {/* Progress bar */}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${isMobile ? 'h-1.5' : 'h-2'}`}
      >
        <div
          className={`bg-blue-600 rounded-full transition-all duration-300 ${isMobile ? 'h-1.5' : 'h-2'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Text display */}
      <div className="relative">
        <div
          className={`${isMobile ? 'p-4 text-base min-h-[250px]' : 'p-6 text-lg min-h-[300px]'} bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-[60vh]`}
        >
          {renderedContent}
        </div>

        {/* Pause overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div
              className={`bg-white dark:bg-gray-800 ${isMobile ? 'p-4 mx-4' : 'p-6'} rounded-lg shadow-lg text-center`}
            >
              <p className={`font-semibold mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Session Paused
              </p>
              <p className={`text-gray-600 dark:text-gray-400 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                {isMobile ? 'Tap Resume to continue' : 'Press ESC or click Resume to continue'}
              </p>
              <button
                onClick={resumeSession}
                className={`${isMobile ? 'px-5 py-2.5' : 'px-6 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation`}
              >
                Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for capturing keystrokes */}
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="sr-only"
        aria-label="Typing input"
        disabled={!isSessionActive || isPaused}
      />

      {/* Instructions */}
      <div
        className={`text-gray-600 dark:text-gray-400 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}
      >
        {isPaused ? (
          <span>{isMobile ? 'Tap Resume to continue' : 'Press ESC to resume'}</span>
        ) : (
          <span>
            {isMobile ? 'Type the text above' : 'Type the text above. Press ESC to pause.'}
          </span>
        )}
      </div>

      {/* Session info */}
      {currentSession && (
        <div
          className={`flex justify-between text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
        >
          <span>
            Position: {userInput.length} / {content.length}
          </span>
          <span>Errors: {currentSession.metrics.errorCount}</span>
        </div>
      )}
    </div>
  );
});

TypingInterface.displayName = 'TypingInterface';
