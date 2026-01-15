"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RatingsDistributionChartProps {
  data: Array<{ rating: number; count: number }>;
}

export default function RatingsDistributionChart({ data }: RatingsDistributionChartProps) {
  // Ensure all ratings 1-5 are represented
  const fullData = [1, 2, 3, 4, 5].map((rating) => {
    const existing = data.find((d) => d.rating === rating);
    return existing || { rating, count: 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={fullData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="rating"
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
        <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
