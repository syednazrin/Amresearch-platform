"use client";

import Image from "next/image";
import Modal from "@/app/components/ui/Modal";
import { Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export default function TripDetailModal({ isOpen, onClose, trip }: TripDetailModalProps) {
  const router = useRouter();
  
  if (!trip) return null;

  const isUpcoming = new Date(trip.date) >= new Date();
  const status = isUpcoming ? "Upcoming" : "Completed";

  const handleJoinVisit = () => {
    onClose();
    router.push(`/trips/join/${trip._id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Image */}
        {trip.imageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={trip.imageUrl}
              alt={trip.companyName}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 text-[10px] font-semibold tracking-wider uppercase ${
              isUpcoming
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Company Name */}
        <div>
          <h2 className="text-2xl font-light text-black tracking-tight leading-tight mb-3">
            {trip.companyName}
          </h2>
        </div>

        {/* Date and Location */}
        <div className="space-y-2 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(trip.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{trip.location}</span>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line line-clamp-3">
              {trip.description}
            </p>
          </div>
        )}

        {/* Join Visit Button */}
        {isUpcoming && (
          <div className="pt-2">
            <button
              onClick={handleJoinVisit}
              className="w-full px-4 py-2.5 text-white text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-all duration-300"
              style={{ backgroundColor: '#FF0009' }}
            >
              Join Visit
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
