"use client";

import { MapPin, Calendar } from "lucide-react";
import Card from "./ui/Card";
import { formatDate } from "@/lib/utils";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <Card hover={!!onClick} onClick={onClick}>
      {trip.imageUrl && (
        <div className="mb-4 -mx-6 -mt-6">
          <img
            src={trip.imageUrl}
            alt={trip.companyName}
            className="w-full h-40 object-cover rounded-t-xl"
          />
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">{trip.companyName}</h3>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(trip.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{trip.location}</span>
        </div>
      </div>
      
      {trip.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
      )}
    </Card>
  );
}
