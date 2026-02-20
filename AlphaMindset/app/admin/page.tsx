"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { formatDate, formatDateTime } from "@/lib/utils";
import { FileText, Eye, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import ViewsOverTimeChart from "@/app/components/admin/ViewsOverTimeChart";
import ViewsTodayByHourChart from "@/app/components/admin/ViewsTodayByHourChart";
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

interface TodayViewsByHour {
  hour: number;
  label: string;
  views: number;
}

interface Analyst {
  _id: string;
  name: string;
  title?: string;
}

interface AnalystSummary {
  totalReports: number;
  totalViews: number;
  totalFeedback: number;
  agreePercentage: number;
  averageRating: number;
}

type ViewMode = 'daily' | 'general' | 'analyst';
type DateRange = '7' | '30' | 'all';

const DEMO_ANALYST_ID = 'demo';

const FAKE_ANALYST_SUMMARY: AnalystSummary = {
  totalReports: 12,
  totalViews: 2847,
  totalFeedback: 156,
  agreePercentage: 72,
  averageRating: 4.2,
};

const FAKE_ANALYST_REPORTS: TodayReport[] = [
  { _id: 'demo-1', title: 'Banking Sector Outlook Q4 2025', publishTime: '09:15 AM', totalViews: 342, agreePercentage: 78, averageRating: 4.5, commentCount: 12, uploadedAt: '' },
  { _id: 'demo-2', title: 'Consumer Staples – Earnings Review', publishTime: '10:30 AM', totalViews: 218, agreePercentage: 65, averageRating: 3.8, commentCount: 5, uploadedAt: '' },
  { _id: 'demo-3', title: 'Technology Sector Update', publishTime: '02:00 PM', totalViews: 521, agreePercentage: 82, averageRating: 4.6, commentCount: 18, uploadedAt: '' },
  { _id: 'demo-4', title: 'Property Market Outlook', publishTime: '11:45 AM', totalViews: 189, agreePercentage: 71, averageRating: 4.0, commentCount: 8, uploadedAt: '' },
  { _id: 'demo-5', title: 'Oil & Gas – Price Sensitivity Analysis', publishTime: '03:20 PM', totalViews: 156, agreePercentage: 68, averageRating: 3.9, commentCount: 3, uploadedAt: '' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayReports, setTodayReports] = useState<TodayReport[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [todayViewsByHour, setTodayViewsByHour] = useState<TodayViewsByHour[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('7');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [selectedAnalystId, setSelectedAnalystId] = useState<string>('');
  const [analystReports, setAnalystReports] = useState<TodayReport[]>([]);
  const [analystSummary, setAnalystSummary] = useState<AnalystSummary | null>(null);
  const [analystLoading, setAnalystLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && viewMode === 'general') {
      fetchTimeSeriesData();
    }
  }, [viewMode, selectedDateRange, loading]);

  useEffect(() => {
    if (!loading && viewMode === 'daily') {
      fetchTodayViewsByHour();
    }
  }, [viewMode, loading]);

  useEffect(() => {
    if (viewMode === 'analyst') {
      fetch('/api/analysts')
        .then((res) => res.json())
        .then((data) => {
          const list = data.analysts || [];
          setAnalysts([...list, { _id: DEMO_ANALYST_ID, name: 'Demo (sample data)', title: 'Sample' }]);
        })
        .catch(() => setAnalysts([{ _id: DEMO_ANALYST_ID, name: 'Demo (sample data)', title: 'Sample' }]));
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== 'analyst' || !selectedAnalystId) {
      setAnalystReports([]);
      setAnalystSummary(null);
      return;
    }
    if (selectedAnalystId === DEMO_ANALYST_ID) {
      setAnalystReports(FAKE_ANALYST_REPORTS);
      setAnalystSummary(FAKE_ANALYST_SUMMARY);
      setAnalystLoading(false);
      return;
    }
    setAnalystLoading(true);
    fetch(`/api/admin/analytics/analyst-reports?analystId=${encodeURIComponent(selectedAnalystId)}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalystReports(data.reports || []);
        setAnalystSummary(data.summary || null);
      })
      .catch(() => {
        setAnalystReports([]);
        setAnalystSummary(null);
      })
      .finally(() => setAnalystLoading(false));
  }, [viewMode, selectedAnalystId]);

  const fetchTodayViewsByHour = async () => {
    try {
      const res = await fetch('/api/admin/analytics/views-today-by-hour');
      const data = await res.json();
      setTodayViewsByHour(data.data || []);
    } catch (e) {
      console.error('Error fetching views today by hour:', e);
      setTodayViewsByHour([]);
    }
  };

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
      const response = await fetch(`/api/admin/analytics/views-over-time?days=${selectedDateRange}`);
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
      {/* Header + Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-extralight text-black tracking-tighter mb-4">Dashboard</h1>
          <div className="w-24 h-px bg-black mb-4"></div>
          <p className="text-sm text-gray-600">Analytics for research reports</p>
        </div>
        <div className="flex border border-gray-200 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors rounded-md ${
              viewMode === 'daily' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Daily view
          </button>
          <button
            type="button"
            onClick={() => setViewMode('general')}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors rounded-md ${
              viewMode === 'general' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setViewMode('analyst')}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors rounded-md ${
              viewMode === 'analyst' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Analyst
          </button>
        </div>
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

      {/* Daily view: Time series (reads by hour) + Today's Reports + per-report analytics */}
      {viewMode === 'daily' && (
        <>
          <div className="border border-gray-200 p-6">
            <h2 className="text-2xl font-light text-black tracking-tight mb-2">When reports are read (today)</h2>
            <p className="text-sm text-gray-500 mb-6">Report views by hour for the current day</p>
            {todayViewsByHour.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-gray-500">
                No view data for today yet
              </div>
            ) : (
              <ViewsTodayByHourChart data={todayViewsByHour} />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-light text-black tracking-tight mb-2">Today&apos;s Reports</h2>
            <p className="text-sm text-gray-500 mb-6">Click a report to view its analytics</p>
            {todayReports.length === 0 ? (
            <div className="border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-600">No reports published today</p>
            </div>
          ) : (
            <div className="border border-gray-200">
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
        </>
      )}

      {/* Analyst view: reports by analyst, general stats + by report */}
      {viewMode === 'analyst' && (
        <>
          <div className="border border-gray-200 p-6">
            <h2 className="text-2xl font-light text-black tracking-tight mb-2">Reports by analyst</h2>
            <p className="text-sm text-gray-500 mb-4">Select an analyst to see all their reports and aggregate insights</p>
            <select
              value={selectedAnalystId}
              onChange={(e) => setSelectedAnalystId(e.target.value)}
              className="border border-gray-200 px-4 py-2 text-sm text-gray-900 bg-white min-w-[200px]"
            >
              <option value="">Select analyst</option>
              {analysts.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
          {selectedAnalystId && (
            <>
              {analystLoading ? (
                <div className="border border-gray-200 p-12 text-center text-sm text-gray-500">Loading…</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="border border-gray-200 p-6">
                      <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Total Reports</p>
                      <p className="text-3xl font-extralight text-black">{analystSummary?.totalReports ?? 0}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Total Views</p>
                      <p className="text-3xl font-extralight text-black">{analystSummary?.totalViews ?? 0}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Agree %</p>
                      <p className="text-3xl font-extralight text-black">{analystSummary?.agreePercentage ?? 0}%</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">Avg Rating</p>
                      <p className="text-3xl font-extralight text-black">
                        {analystSummary?.averageRating != null ? analystSummary.averageRating.toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-black tracking-tight mb-2">By report</h2>
                    <p className="text-sm text-gray-500 mb-6">Click a report to view its analytics</p>
                    {analystReports.length === 0 ? (
                      <div className="border border-gray-200 p-12 text-center">
                        <p className="text-sm text-gray-600">No reports for this analyst</p>
                      </div>
                    ) : (
                      <div className="border border-gray-200">
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
                        <div className="divide-y divide-gray-200">
                          {analystReports.map((report, index) => (
                            <div
                              key={report._id}
                              className={`grid grid-cols-12 gap-4 p-4 transition-colors ${
                                report._id.startsWith('demo-') ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
                              } ${index !== analystReports.length - 1 ? 'border-b border-gray-200' : ''}`}
                              onClick={() => !report._id.startsWith('demo-') && handleReportClick(report._id)}
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
                </>
              )}
            </>
          )}
        </>
      )}

      {/* General view: Time-Series Engagement (7, 30, All time) */}
      {viewMode === 'general' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-black tracking-tight">Views over time</h2>
            <div className="flex gap-2">
              {(['7', '30', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedDateRange(range)}
                  className={`px-4 py-2 text-xs tracking-wider uppercase border transition-colors ${
                    selectedDateRange === range
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-black'
                  }`}
                >
                  {range === '7' ? '7 Days' : range === '30' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
          <div className="border border-gray-200 p-6">
            {timeSeriesData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-gray-500">
                No data available for this range
              </div>
            ) : (
              <ViewsOverTimeChart data={timeSeriesData} />
            )}
          </div>
        </div>
      )}

      {/* Per-Report Analytics Modal */}
      <PerReportAnalyticsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reportId={selectedReportId}
      />
    </div>
  );
}
