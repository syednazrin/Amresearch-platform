"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface UpcomingTripCarouselProps {
  trips: Trip[];
}

export default function UpcomingTripCarousel({ trips }: UpcomingTripCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Filter and sort upcoming trips
  const upcomingTrips = trips
    .filter(trip => new Date(trip.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    if (upcomingTrips.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % upcomingTrips.length);
        setIsVisible(true);
      }, 300); // Half of transition duration
    }, 6000); // 6 seconds per trip

    return () => clearInterval(interval);
  }, [upcomingTrips.length]);

  if (upcomingTrips.length === 0) {
    return (
      <div className="space-y-4 py-8">
        <p className="text-sm text-gray-500">No upcoming trips scheduled</p>
      </div>
    );
  }

  const currentTrip = upcomingTrips[currentIndex];

  return (
    <div className="relative min-h-[200px]">
      <div
        className={`transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="space-y-4">
          {/* Date */}
          <div className="flex items-center gap-3 text-xs text-gray-400 tracking-[0.5em] uppercase">
            <Calendar className="w-4 h-4" />
            <span className="font-bold text-black">{formatDate(currentTrip.date)}</span>
          </div>

          {/* Company Name */}
          <h3 className="text-3xl md:text-4xl font-light text-black tracking-tight leading-tight">
            {currentTrip.companyName}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-3 text-sm text-gray-600 pb-4 border-b border-gray-200">
            <MapPin className="w-4 h-4" />
            <span>{currentTrip.location}</span>
          </div>

          {/* Description */}
          {currentTrip.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {currentTrip.description.length > 150
                ? `${currentTrip.description.substring(0, 150)}...`
                : currentTrip.description}
            </p>
          )}

          {/* Indicator dots */}
          {upcomingTrips.length > 1 && (
            <div className="flex items-center gap-2 pt-4">
              {upcomingTrips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsVisible(true);
                    }, 300);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-black"
                      : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to trip ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
