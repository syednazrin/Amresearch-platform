"use client";

interface AgreeDisagreeChartProps {
  agreed: number;
  disagreed: number;
}

export default function AgreeDisagreeChart({ agreed, disagreed }: AgreeDisagreeChartProps) {
  const total = agreed + disagreed;
  const agreePercentage = total > 0 ? Math.round((agreed / total) * 100) : 0;
  const disagreePercentage = total > 0 ? Math.round((disagreed / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-500">
        No feedback yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual bars */}
      <div className="flex h-8 border border-gray-200 overflow-hidden">
        <div
          className="bg-black flex items-center justify-center text-white text-xs font-semibold"
          style={{ width: `${agreePercentage}%` }}
        >
          {agreePercentage > 10 && `${agreePercentage}%`}
        </div>
        <div
          className="bg-gray-300 flex items-center justify-center text-black text-xs font-semibold"
          style={{ width: `${disagreePercentage}%` }}
        >
          {disagreePercentage > 10 && `${disagreePercentage}%`}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div>
          <span className="text-gray-700">Agree: {agreed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300"></div>
          <span className="text-gray-700">Disagree: {disagreed}</span>
        </div>
      </div>
    </div>
  );
}
