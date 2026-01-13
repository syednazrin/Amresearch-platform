"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import StarRating from "@/app/components/ui/StarRating";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { ThumbsUp, ThumbsDown, Download } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface Feedback {
  _id: string;
  agreedWithThesis: boolean;
  rating: number;
  feedback: string;
  submittedAt: string;
}

interface Stats {
  total: number;
  agreed: number;
  disagreed: number;
  agreementPercentage: number;
  averageRating: number;
}

export default function DocumentFeedbackPage() {
  const params = useParams();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchFeedback();
    }
  }, [params.id]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Agreement", "Rating", "Feedback"];
    const rows = feedback.map((f) => [
      formatDateTime(f.submittedAt),
      f.agreedWithThesis ? "Agreed" : "Disagreed",
      f.rating.toString(),
      `"${f.feedback.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `feedback-${params.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Document Feedback</h1>
        {feedback.length > 0 && (
          <Button variant="ghost" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Agreement Rate</p>
            <p className="text-3xl font-bold text-green-600">{stats.agreementPercentage}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.agreed} agreed, {stats.disagreed} disagreed
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
              <StarRating value={stats.averageRating} readonly size="sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Comments</p>
            <p className="text-3xl font-bold text-gray-900">
              {feedback.filter((f) => f.feedback).length}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200">
        {feedback.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No feedback received yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {item.agreedWithThesis ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-semibold">Agreed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-semibold">Disagreed</span>
                      </div>
                    )}
                    <div className="w-px h-6 bg-gray-300" />
                    <StarRating value={item.rating} readonly size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">{formatDateTime(item.submittedAt)}</p>
                </div>
                {item.feedback && (
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{item.feedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
