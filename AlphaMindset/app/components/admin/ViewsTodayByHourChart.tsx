"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ViewsTodayByHourChartProps {
  data: Array<{ hour: number; label: string; views: number }>;
}

export default function ViewsTodayByHourChart({ data }: ViewsTodayByHourChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          stroke="#6b7280"
          style={{ fontSize: "11px" }}
          tick={{ fill: "#6b7280" }}
          interval={1}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            fontSize: "12px",
          }}
          labelFormatter={(label) => `Hour ${label}`}
          formatter={(value: number) => [`${value} reads`, "Views"]}
        />
        <Bar dataKey="views" fill="#000000" radius={[2, 2, 0, 0]} name="Reads" />
      </BarChart>
    </ResponsiveContainer>
  );
}
