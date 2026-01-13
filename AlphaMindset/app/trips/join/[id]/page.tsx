"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PublicNav from "@/app/components/PublicNav";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function JoinVisitPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      const data = await response.json();
      if (data.trip) {
        setTrip(data.trip);
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in at least your name and email");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/trip-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: tripId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to register for visit");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register for visit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500">Loading trip details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500 mb-4">Trip not found</p>
            <button
              onClick={() => router.push("/trips/calendar")}
              className="text-sm text-gray-600 hover:text-black"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(trip.date) >= new Date();

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-light text-black tracking-tight">
                Registration Successful
              </h1>
              <p className="text-sm text-gray-600">
                Thank you for registering for the visit to {trip.companyName}. 
                We'll send you a confirmation email shortly with further details.
              </p>
              <div className="pt-6">
                <Button onClick={() => router.push("/trips/calendar")}>
                  Back to Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="pt-6 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Trip Info Card */}
          <div className="border border-gray-200 p-4 mb-6">
            <h1 className="text-2xl font-light text-black tracking-tight mb-3">
              Join Visit: {trip.companyName}
            </h1>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{trip.location}</span>
              </div>
            </div>
            {trip.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {trip.description}
              </p>
            )}
          </div>

          {/* Registration Form */}
          {isUpcoming ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-light text-black tracking-tight mb-4">
                  Registration Information
                </h2>
                <div className="space-y-3">
                  <Input
                    label="Full Name *"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    required
                  />
                  <Input
                    label="Company"
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Enter your company name"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any additional information or questions..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-vertical"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Register for Visit"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-gray-200">
              <p className="text-sm text-gray-600">
                This visit has already been completed. Registration is no longer available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
