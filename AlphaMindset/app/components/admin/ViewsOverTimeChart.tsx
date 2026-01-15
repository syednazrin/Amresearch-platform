"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ViewsOverTimeChartProps {
  data: Array<{ date: string; views: number }>;
}

export default function ViewsOverTimeChart({ data }: ViewsOverTimeChartProps) {
  // Format dates for display (short format)
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="dateLabel"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#000', fontWeight: 'normal' }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#000000"
          strokeWidth={2}
          dot={{ fill: '#000000', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
