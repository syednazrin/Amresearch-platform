"use client";

import { useState, useEffect } from "react";
import PublicNav from "@/app/components/PublicNav";
import TripDetailModal from "@/app/components/TripDetailModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function TripsCalendarPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips");
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTripsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trips.filter(trip => {
      const tripDate = new Date(trip.date).toISOString().split('T')[0];
      return tripDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const handleDateClick = (date: Date) => {
    const tripsForDate = getTripsForDate(date);
    if (tripsForDate.length > 0) {
      setSelectedTrip(tripsForDate[0]);
      setIsModalOpen(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    days.push(date);
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Header */}
      <div className="pt-20 pb-6 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight text-black tracking-tighter mb-3">
              Company Visits Calendar
            </h1>
            <div className="w-24 h-px bg-black mb-2"></div>
            <p className="text-xs text-gray-500 tracking-wider">
              View all scheduled corporate visits
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500 tracking-wide">Loading calendar...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-light text-black tracking-tight">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-3">
                {/* Day Names Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase text-center py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square p-1" />;
                    }

                    const tripsForDate = getTripsForDate(date);
                    const hasTrip = tripsForDate.length > 0;
                    const isCurrentDay = isToday(date);
                    const isPastDate = isPast(date);

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateClick(date)}
                        disabled={!hasTrip}
                        className={`
                          aspect-square p-1 text-xs transition-all duration-200
                          ${hasTrip
                            ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                            : 'text-gray-400 hover:bg-gray-50 cursor-default'
                          }
                          ${isCurrentDay && !hasTrip
                            ? 'border border-black'
                            : ''
                          }
                          ${isPastDate && hasTrip
                            ? 'opacity-60'
                            : ''
                          }
                        `}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className={hasTrip ? 'font-semibold text-[11px]' : 'text-[11px]'}>
                            {date.getDate()}
                          </span>
                          {hasTrip && (
                            <span className="text-[8px] mt-0.5 opacity-80">
                              {tripsForDate.length}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trip Detail Modal */}
      <TripDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
      />
    </div>
  );
}
