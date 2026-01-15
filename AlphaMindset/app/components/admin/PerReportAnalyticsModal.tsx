"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/ui/Modal";
import ViewsOverTimeChart from "./ViewsOverTimeChart";
import RatingsDistributionChart from "./RatingsDistributionChart";
import AgreeDisagreeChart from "./AgreeDisagreeChart";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface PerReportAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string | null;
}

interface ReportData {
  _id: string;
  title: string;
  uploadedAt: string;
  totalViews: number;
  averageRating: number;
  agreedCount: number;
  disagreedCount: number;
}

interface AnalyticsData {
  viewsOverTime: Array<{ date: string; views: number }>;
  ratingsDistribution: Array<{ rating: number; count: number }>;
  comments: Array<{
    rating: number;
    agreedWithThesis: boolean;
    feedback: string;
    submittedAt: string;
  }>;
}

export default function PerReportAnalyticsModal({
  isOpen,
  onClose,
  reportId,
}: PerReportAnalyticsModalProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportAnalytics();
    } else {
      setReport(null);
      setAnalytics(null);
    }
  }, [isOpen, reportId]);

  const fetchReportAnalytics = async () => {
    if (!reportId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/report/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch report analytics");
      }
    } catch (error) {
      console.error("Error fetching report analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={report?.title || "Report Analytics"}>
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : report && analytics ? (
        <div className="space-y-8">
          {/* Header Info */}
          <div className="space-y-4 border-b border-gray-200 pb-6">
            <div>
              <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Published</p>
              <p className="text-sm text-gray-700">{formatDate(report.uploadedAt)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Total Views</p>
                <p className="text-2xl font-extralight text-black">{report.totalViews}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Average Rating</p>
                <p className="text-2xl font-extralight text-black">{report.averageRating.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Agree / Disagree</p>
                <p className="text-sm text-gray-700">
                  {report.agreedCount} / {report.disagreedCount}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-8">
            {/* Views Over Time */}
            <div>
              <h3 className="text-lg font-light text-black tracking-tight mb-4">Views Over Time</h3>
              <div className="border border-gray-200 p-6">
                <ViewsOverTimeChart data={analytics.viewsOverTime} />
              </div>
            </div>

            {/* Ratings Distribution */}
            <div>
              <h3 className="text-lg font-light text-black tracking-tight mb-4">Ratings Distribution</h3>
              <div className="border border-gray-200 p-6">
                <RatingsDistributionChart data={analytics.ratingsDistribution} />
              </div>
            </div>

            {/* Agree vs Disagree */}
            <div>
              <h3 className="text-lg font-light text-black tracking-tight mb-4">Agree vs Disagree</h3>
              <div className="border border-gray-200 p-6">
                <AgreeDisagreeChart agreed={report.agreedCount} disagreed={report.disagreedCount} />
              </div>
            </div>
          </div>

          {/* Comments & Feedback */}
          {analytics.comments.length > 0 && (
            <div>
              <h3 className="text-lg font-light text-black tracking-tight mb-4">Comments & Feedback</h3>
              <div className="border border-gray-200 max-h-64 overflow-y-auto">
                {analytics.comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`p-4 ${index !== analytics.comments.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-700 tracking-wider uppercase">
                          {comment.rating} {comment.rating === 1 ? 'star' : 'stars'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold tracking-wider uppercase ${
                            comment.agreedWithThesis
                              ? 'bg-black text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {comment.agreedWithThesis ? 'Agree' : 'Disagree'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(comment.submittedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{comment.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600">No analytics data available</p>
        </div>
      )}
    </Modal>
  );
}
