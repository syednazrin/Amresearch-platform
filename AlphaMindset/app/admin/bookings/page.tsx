"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import Button from "@/app/components/ui/Button";
import { Check, X, Trash2, Clock, Mail, Phone, Calendar, Sparkles } from "lucide-react";

interface Booking {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  duration: number;
  notes: string;
  status: string;
  createdAt: string;
  analyst?: {
    _id: string;
    name: string;
    title?: string;
  };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const url = filter === "all" ? "/api/bookings" : `/api/bookings?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "confirmed" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("confirmed")}
          >
            Confirmed
          </Button>
          <Button
            variant={filter === "cancelled" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {booking.email}
                      </div>
                      {booking.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {booking.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(booking.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {booking.duration} minutes
                  </div>
                  {booking.analyst && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Sparkles className="w-4 h-4" />
                      {booking.analyst.name}
                    </div>
                  )}
                </div>

                {booking.phone && (
                  <div className="mb-3 text-sm text-gray-600">
                    <strong>Company:</strong> {booking.phone}
                  </div>
                )}

                {booking.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{booking.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking._id, "confirmed")}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => updateStatus(booking._id, "cancelled")}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateStatus(booking._id, "cancelled")}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBooking(booking._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
