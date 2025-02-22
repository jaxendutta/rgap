// src/components/features/visualizations/TrendVisualizer.tsx
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/ui/Card';
import { Dropdown } from '@/components/common/ui/Dropdown';

interface TrendVisualizerProps {
  data: any[];
  groupBy: string;
  onGroupByChange: (value: string) => void;
  groupByOptions: Array<{ value: string; label: string; }>;
}

// Type-safe color definitions
interface ColorScheme {
  readonly NSERC: string;
  readonly SSHRC: string;
  readonly CIHR: string;
  readonly defaultColors: readonly string[];
}

const colors: ColorScheme = {
  NSERC: "#2563eb",
  SSHRC: "#7c3aed",
  CIHR: "#059669",
  defaultColors: [
    "#2563eb", "#7c3aed", "#059669", "#dc2626",
    "#ea580c", "#0891b2", "#4f46e5", "#be185d",
  ] as const
} as const;

export const TrendVisualizer = ({
  data,
  groupBy,
  onGroupByChange,
  groupByOptions
}: TrendVisualizerProps) => {
  // Get all categories for the legend
  const categories = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).filter(key => key !== 'year');
  }, [data]);

  // Function to get color for a category
  const getColorForCategory = (category: string, index: number): string => {
    return (category in colors) 
      ? colors[category as keyof typeof colors] as string 
      : colors.defaultColors[index % colors.defaultColors.length];
  };

  return (
    <Card className="p-4 lg:p-6">
      {/* Header with Dropdown */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h3 className="text-lg font-medium whitespace-nowrap">Funding Trends by</h3>
        <Dropdown
          value={groupBy}
          options={groupByOptions}
          onChange={onGroupByChange}
          className="w-40"
        />
      </div>

      {/* Chart Container */}
      <div className="space-y-6">
        {/* Chart */}
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => {
                  const millions = value / 1000000;
                  return `$${millions.toFixed(1)}M`;
                }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                fontSize={12}
                width={80}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat('en-CA', {
                    style: 'currency',
                    currency: 'CAD',
                    maximumFractionDigits: 0
                  }).format(value),
                  name
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
              {categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  name={category}
                  stroke={getColorForCategory(category, index)}
                  strokeWidth={2.5}
                  dot={{
                    r: 6,
                    fill: getColorForCategory(category, index),
                    strokeWidth: 0
                  }}
                  activeDot={{
                    r: 8,
                    fill: getColorForCategory(category, index),
                    strokeWidth: 0
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-2">
          {categories.map((category, index) => (
            <div
              key={category}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: getColorForCategory(category, index)
                }}
              />
              <span className="text-sm text-gray-600">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};