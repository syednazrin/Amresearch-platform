"use client";

import { useState, useEffect } from "react";
import PublicNav from "@/app/components/PublicNav";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips?upcoming=true");
      const data = await response.json();
      const sortedTrips = (data.trips || []).sort((a: Trip, b: Trip) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTrips(sortedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      
      {/* Header Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight text-black tracking-tighter mb-6">
              Company Visits
            </h1>
            <div className="w-32 h-px bg-black mb-8"></div>
            <p className="text-sm text-gray-500 tracking-wider">
              {trips.length} {trips.length === 1 ? "visit" : "visits"} scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="px-6 pb-32">
        <div className="max-w-7xl mx-auto relative">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500 tracking-wide">Loading visits...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <p className="text-lg text-gray-500 mb-6 tracking-wide">No visits scheduled</p>
            </div>
          ) : (
            <>
              {/* Vertical Timeline Line - Hidden on mobile */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />
              
              <div className="space-y-32">
                {trips.map((trip, index) => (
                  <div
                    key={trip._id}
                    className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                  >
                    {/* Timeline Dot - Hidden on mobile */}
                    <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full z-10 border-4 border-white" />
                    
                    {/* Content - Left on even, Right on odd */}
                    <div className={`space-y-6 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12 lg:col-start-2'}`}>
                      <div className="space-y-3">
                        <div className={`flex items-center gap-3 text-xs text-gray-400 tracking-[0.5em] uppercase ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="font-bold text-black">{formatDate(trip.date)}</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-light text-black tracking-tight leading-tight">
                          {trip.companyName}
                        </h3>
                      </div>
                      
                      <div className={`flex items-center gap-3 text-sm text-gray-600 pb-6 border-b border-gray-200 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <MapPin className="w-4 h-4" />
                        <span>{trip.location}</span>
                      </div>
                      
                      {trip.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {trip.description}
                        </p>
                      )}
                    </div>

                    {/* Image - Right on even, Left on odd */}
                    <div className={`relative aspect-[4/3] bg-gray-100 overflow-hidden ${index % 2 === 0 ? 'lg:col-start-2 lg:row-start-1' : 'lg:col-start-1 lg:row-start-1'}`}>
                      {trip.imageUrl ? (
                        <Image
                          src={trip.imageUrl}
                          alt={trip.companyName}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-sm text-gray-400 tracking-wider uppercase">
                              {trip.companyName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
