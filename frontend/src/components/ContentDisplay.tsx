import { useMemo } from 'react';
import type { StudyContent } from '../types';
import {
  getDifficultyColor,
  getDifficultyLabel,
  getPreviewText,
  processContent,
} from '../utils/contentProcessor';

interface ContentDisplayProps {
  content: StudyContent;
  showPreview?: boolean;
  onStartTyping?: () => void;
  onRefresh?: () => void;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  showPreview = false,
  onStartTyping,
  onRefresh,
}) => {
  const processed = useMemo(() => processContent(content), [content]);

  const displayText = showPreview ? getPreviewText(processed.formatted, 30) : processed.formatted;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Header with theme and metadata */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{content.theme}</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {processed.wordCount} words
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ~{processed.estimatedTime} min
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              {content.source}
            </span>
          </div>
        </div>

        {/* Difficulty badge */}
        <div
          className={`px-3 py-1 rounded-full border text-sm font-medium ${getDifficultyColor(processed.difficulty)}`}
        >
          {getDifficultyLabel(processed.difficulty)}
        </div>
      </div>

      {/* Content text */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
          {displayText}
        </p>
        {showPreview && (
          <p className="text-gray-500 text-sm mt-2 italic">
            Preview - Click "Start Typing" to see full content
          </p>
        )}
      </div>

      {/* Metadata section */}
      {content.metadata && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {content.metadata.aiModel && (
            <span className="px-2 py-1 bg-blue-50 rounded border border-blue-200">
              AI: {content.metadata.aiModel}
            </span>
          )}
          {content.metadata.wikipediaArticle && (
            <span className="px-2 py-1 bg-purple-50 rounded border border-purple-200">
              Wikipedia: {content.metadata.wikipediaArticle}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">
            Language: {content.metadata.language.toUpperCase()}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        {onStartTyping && (
          <button
            onClick={onStartTyping}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Start Typing
          </button>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Content
          </button>
        )}
      </div>
    </div>
  );
};
