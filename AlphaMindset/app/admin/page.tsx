"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { formatDate, formatDateTime } from "@/lib/utils";
import { FileText, MessageSquare, Calendar, Plane, Eye, ArrowRight } from "lucide-react";

interface Stats {
  totalDocuments: number;
  totalViews: number;
  recentFeedback: number;
  upcomingBookings: number;
  upcomingTrips: number;
}

interface RecentDocument {
  _id: string;
  title: string;
  uploadedAt: string;
  viewCount: number;
}

interface RecentBooking {
  _id: string;
  name: string;
  email: string;
  date: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data.stats);
      setRecentDocuments(data.recentActivity.documents);
      setRecentBookings(data.recentActivity.bookings);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
        <p className="text-sm text-gray-600">Welcome to your admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => router.push("/admin/documents")}
          className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.totalDocuments || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Total Documents</p>
        </div>

        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.totalViews || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Total Views</p>
        </div>

        <div
          onClick={() => router.push("/admin/bookings")}
          className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.upcomingBookings || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Upcoming Bookings</p>
        </div>

        <div
          onClick={() => router.push("/admin/trips")}
          className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <Plane className="w-6 h-6 text-black" />
            <span className="text-3xl font-extralight text-black">{stats?.upcomingTrips || 0}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">Upcoming Trips</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-black tracking-tight">Recent Documents</h2>
            <button
              onClick={() => router.push("/admin/documents")}
              className="text-xs text-black hover:underline flex items-center gap-1 tracking-wider uppercase font-semibold"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-600">No documents yet</p>
            </div>
          ) : (
            <div className="space-y-2 border border-gray-200">
              {recentDocuments.map((doc, index) => (
                <div
                  key={doc._id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index !== recentDocuments.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                  onClick={() => router.push(`/documents/${doc._id}`)}
                >
                  <div className="flex-1">
                    <p className="font-light text-black mb-1">{doc.title}</p>
                    <p className="text-xs text-gray-500 tracking-wider uppercase">{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{doc.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-black tracking-tight">Recent Bookings</h2>
            <button
              onClick={() => router.push("/admin/bookings")}
              className="text-xs text-black hover:underline flex items-center gap-1 tracking-wider uppercase font-semibold"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-600">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-2 border border-gray-200">
              {recentBookings.map((booking, index) => (
                <div
                  key={booking._id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== recentBookings.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-light text-black mb-1">{booking.name}</p>
                    <p className="text-xs text-gray-500 tracking-wider uppercase">{formatDateTime(booking.date)}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-gray-100 text-gray-700">
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
