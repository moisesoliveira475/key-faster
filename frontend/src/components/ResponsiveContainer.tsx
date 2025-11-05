import type { ReactNode } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Responsive container that adapts padding and spacing for mobile/desktop
 */
export const ResponsiveContainer = ({
  children,
  className = '',
  noPadding = false,
}: ResponsiveContainerProps) => {
  const isMobile = useIsMobile();

  const paddingClass = noPadding ? '' : isMobile ? 'px-4 py-3' : 'px-6 py-4';

  return <div className={`${paddingClass} ${className}`}>{children}</div>;
};

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

/**
 * Responsive card component with mobile-optimized styling
 */
export const ResponsiveCard = ({ children, className = '', title }: ResponsiveCardProps) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg 
        border border-gray-200 dark:border-gray-700
        ${isMobile ? 'shadow-sm' : 'shadow-lg'}
        ${className}
      `}
    >
      {title && (
        <div
          className={`border-b border-gray-200 dark:border-gray-700 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}
        >
          <h2
            className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-lg' : 'text-xl'}`}
          >
            {title}
          </h2>
        </div>
      )}
      <ResponsiveContainer noPadding={!!title}>{children}</ResponsiveContainer>
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

/**
 * Responsive grid with configurable columns for different breakpoints
 */
export const ResponsiveGrid = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 3, tablet: 4, desktop: 6 },
  className = '',
}: ResponsiveGridProps) => {
  const gridCols = `
    grid-cols-${columns.mobile || 1}
    md:grid-cols-${columns.tablet || 2}
    lg:grid-cols-${columns.desktop || 3}
  `;

  const gridGap = `
    gap-${gap.mobile || 3}
    md:gap-${gap.tablet || 4}
    lg:gap-${gap.desktop || 6}
  `;

  return <div className={`grid ${gridCols} ${gridGap} ${className}`}>{children}</div>;
};
