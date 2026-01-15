"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { formatDate, formatDateTime } from "@/lib/utils";
import { FileText, Eye, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import ViewsOverTimeChart from "@/app/components/admin/ViewsOverTimeChart";
import PerReportAnalyticsModal from "@/app/components/admin/PerReportAnalyticsModal";

interface Stats {
  totalDocuments: number;
  totalViews: number;
  reportsPublishedToday: number;
  viewsToday: number;
  averageRatingToday: number;
  agreeDisagreeRatioToday: {
    agreed: number;
    disagreed: number;
    percentage: number;
  };
}

interface TodayReport {
  _id: string;
  title: string;
  publishTime: string;
  totalViews: number;
  agreePercentage: number;
  averageRating: number;
  commentCount: number;
  uploadedAt: string;
}

interface TimeSeriesData {
  date: string;
  views: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayReports, setTodayReports] = useState<TodayReport[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchTimeSeriesData();
    }
  }, [selectedDateRange, loading]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, todayReportsResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/analytics/today-reports"),
      ]);

      const statsData = await statsResponse.json();
      const todayReportsData = await todayReportsResponse.json();

      setStats(statsData.stats);
      setTodayReports(todayReportsData.reports || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSeriesData = async () => {
    try {
      const daysParam = selectedDateRange === 'all' ? 'all' : selectedDateRange === 'today' ? 'today' : selectedDateRange;
      const response = await fetch(`/api/admin/analytics/views-over-time?days=${daysParam}`);
      const data = await response.json();
      setTimeSeriesData(data.data || []);
    } catch (error) {
      console.error("Error fetching time series data:", error);
      setTimeSeriesData([]);
    }
  };

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReportId(null);
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <Skeleton className="h-12 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-5xl md:text-6xl font-extralight text-black tracking-tighter mb-4">Dashboard</h1>
        <div className="w-24 h-px bg-black mb-4"></div>
        <p className="text-sm text-gray-600">Analytics for research reports</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Reports Published */}
        <div
          onClick={() => router.push("/admin/documents")}
          className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.totalDocuments || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Total Reports</p>
          <p className="text-xs text-gray-500">{stats?.reportsPublishedToday || 0} published today</p>
        </div>

        {/* Total Views */}
        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.totalViews || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Total Views</p>
          <p className="text-xs text-gray-500">{stats?.viewsToday || 0} views today</p>
        </div>

        {/* Today's Views */}
        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.viewsToday || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Today's Views</p>
        </div>

        {/* Average Rating (Today) */}
        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">
              {stats?.averageRatingToday ? stats.averageRatingToday.toFixed(1) : '0.0'}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Avg Rating (Today)</p>
          <p className="text-xs text-gray-500">
            Based on {((stats?.agreeDisagreeRatioToday?.agreed || 0) + (stats?.agreeDisagreeRatioToday?.disagreed || 0))} ratings
          </p>
        </div>

        {/* Agree vs Disagree (Today) */}
        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <ThumbsUp className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">
              {stats?.agreeDisagreeRatioToday?.agreementPercentage || 0}%
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Agree (Today)</p>
          <p className="text-xs text-gray-500">
            {stats?.agreeDisagreeRatioToday?.agreed || 0} agree, {stats?.agreeDisagreeRatioToday?.disagreed || 0} disagree
          </p>
        </div>
      </div>

      {/* Today's Reports Performance Table */}
      <div>
        <h2 className="text-2xl font-light text-black tracking-tight mb-6">Today's Reports Performance</h2>
        {todayReports.length === 0 ? (
          <div className="border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-600">No reports published today</p>
          </div>
        ) : (
          <div className="border border-gray-200">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-4">
                <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Report Title</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Publish Time</p>
              </div>
              <div className="col-span-1 text-right">
                <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Views</p>
              </div>
              <div className="col-span-1 text-right">
                <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Agree %</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Avg Rating</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Comments</p>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {todayReports.map((report, index) => (
                <div
                  key={report._id}
                  className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index !== todayReports.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                  onClick={() => handleReportClick(report._id)}
                >
                  <div className="col-span-4">
                    <p className="font-light text-black">{report.title}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 tracking-wider uppercase">{report.publishTime}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="text-sm text-gray-700">{report.totalViews}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="text-sm text-gray-700">{report.agreePercentage}%</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm text-gray-700">{report.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm text-gray-700">{report.commentCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time-Series Engagement Chart */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-black tracking-tight">Time-Series Engagement</h2>
          <div className="flex gap-2">
            {(['today', '7days', '30days', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedDateRange(range)}
                className={`px-4 py-2 text-xs tracking-wider uppercase border transition-colors ${
                  selectedDateRange === range
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-black'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : range === 'all' ? 'All Time' : 'Today'}
              </button>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 p-6">
          {timeSeriesData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-sm text-gray-500">
              No data available
            </div>
          ) : (
            <ViewsOverTimeChart data={timeSeriesData} />
          )}
        </div>
      </div>

      {/* Per-Report Analytics Modal */}
      <PerReportAnalyticsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reportId={selectedReportId}
      />
    </div>
  );
}
