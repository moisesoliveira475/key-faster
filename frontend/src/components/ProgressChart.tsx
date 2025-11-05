import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistoricalSession } from '../types';

interface ProgressChartProps {
  sessions: HistoricalSession[];
  metric: 'wpm' | 'accuracy';
  height?: number;
}

export const ProgressChart = ({ sessions, metric, height = 300 }: ProgressChartProps) => {
  // Sort sessions by date (oldest first for chronological display)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Prepare data for the chart
  const chartData = sortedSessions.map((session, index) => ({
    session: index + 1,
    date: new Date(session.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: metric === 'wpm' ? session.wpm : session.accuracy,
    theme: session.theme,
  }));

  // Calculate trend line (simple moving average)
  const movingAverageWindow = 3;
  const dataWithTrend = chartData.map((point, index) => {
    if (index < movingAverageWindow - 1) {
      return { ...point, trend: null };
    }

    const window = chartData.slice(index - movingAverageWindow + 1, index + 1);
    const average = window.reduce((sum, p) => sum + p.value, 0) / movingAverageWindow;

    return { ...point, trend: average };
  });

  const metricLabel = metric === 'wpm' ? 'WPM' : 'Accuracy (%)';
  const metricColor = metric === 'wpm' ? '#3b82f6' : '#10b981';

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          No data available yet. Complete some sessions to see your progress!
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={dataWithTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          domain={metric === 'accuracy' ? [0, 100] : ['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px',
          }}
          formatter={(value: number) => [
            metric === 'accuracy' ? `${value.toFixed(1)}%` : value.toFixed(0),
            metricLabel,
          ]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={metricColor}
          strokeWidth={2}
          dot={{ fill: metricColor, r: 4 }}
          activeDot={{ r: 6 }}
          name={metricLabel}
        />
        {dataWithTrend.some((d) => d.trend !== null) && (
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Trend"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};
