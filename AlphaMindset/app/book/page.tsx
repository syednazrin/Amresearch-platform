"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Calendar from "@/app/components/ui/Calendar";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import PublicNav from "@/app/components/PublicNav";
import { Clock, Check, ArrowRight, ArrowLeft, User } from "lucide-react";

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Analyst {
  _id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  availabilitySlots: any[];
  isActive: boolean;
  order: number;
}

export default function BookingPage() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Analyst Selection
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [selectedAnalyst, setSelectedAnalyst] = useState<Analyst | null>(null);
  
  // Step 2: Date Selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  // Step 3: Time Selection
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Step 4: Contact Information
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    reason: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalysts();
  }, []);

  useEffect(() => {
    if (selectedAnalyst) {
      loadAvailableDates();
    }
  }, [selectedAnalyst]);

  useEffect(() => {
    if (selectedDate && selectedAnalyst) {
      loadAvailableSlots(selectedDate, selectedAnalyst._id);
    }
  }, [selectedDate, selectedAnalyst]);

  const loadAnalysts = async () => {
    try {
      console.log('Fetching analysts...');
      const response = await fetch("/api/analysts");
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Analysts data:', data);
      setAnalysts(data.analysts || []);
    } catch (error) {
      console.error("Error loading analysts:", error);
    }
  };

  const loadAvailableDates = () => {
    if (!selectedAnalyst) return;
    
    const dates: Date[] = [];
    const today = new Date();
    
    // Get unique days of week from availability slots
    const availableDaysOfWeek = new Set(
      selectedAnalyst.availabilitySlots?.map((slot: any) => slot.dayOfWeek) || []
    );
    
    for (let i = 1; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      
      if (availableDaysOfWeek.has(dayOfWeek)) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  };

  const loadAvailableSlots = async (date: Date, analystId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/availability?date=${format(date, 'yyyy-MM-dd')}&analystId=${analystId}`
      );
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnalyst = (analyst: Analyst) => {
    setSelectedAnalyst(analyst);
    setCurrentStep(2);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateSelected = () => {
    if (selectedDate) {
      setCurrentStep(3);
    }
  };

  const handleTimeSelected = () => {
    if (selectedSlot) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !formData.name || !formData.email || !selectedAnalyst) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.company, // Store company in phone field for now
          notes: formData.reason,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedSlot,
          duration: 60, // Default duration
          analystId: selectedAnalyst._id,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to book meeting");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book meeting");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full bg-white p-8 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-light text-black mb-4 tracking-tight">Booking Confirmed!</h2>
          <p className="text-sm text-gray-600 mb-2">
            Your meeting with <strong>{selectedAnalyst?.name}</strong> has been scheduled.
          </p>
          <p className="text-sm text-gray-600 mb-8">
            Date: {format(selectedDate!, 'MMMM d, yyyy')} at {selectedSlot}
            <br />
            We'll send you a confirmation email shortly.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="w-full px-6 py-4 bg-black text-white text-xs tracking-[0.3em] uppercase hover:bg-gray-800 transition-colors font-bold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight text-black tracking-tighter mb-6">
              Book a Meeting
            </h1>
            <div className="w-32 h-px bg-black mb-8"></div>
            <p className="text-sm text-gray-500 tracking-wider">
              Schedule a consultation with our investment team
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-16">
            <div className="flex items-center justify-between max-w-3xl">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 border font-semibold text-sm transition-all ${
                      currentStep >= step
                        ? "bg-black border-black text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-px mx-4 ${
                        currentStep > step ? "bg-black" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between max-w-3xl mt-4">
              <span className="text-xs font-medium text-gray-600 w-1/4 text-center tracking-wider uppercase">Analyst</span>
              <span className="text-xs font-medium text-gray-600 w-1/4 text-center tracking-wider uppercase">Date</span>
              <span className="text-xs font-medium text-gray-600 w-1/4 text-center tracking-wider uppercase">Time</span>
              <span className="text-xs font-medium text-gray-600 w-1/4 text-center tracking-wider uppercase">Your Info</span>
            </div>
          </div>

          {/* Step 1: Select Analyst */}
          {currentStep === 1 && (
            <div className="max-w-4xl">
              <div className="mb-12">
                <h2 className="text-4xl font-light text-black mb-4 tracking-tight">
                  Choose Your Analyst
                </h2>
                <p className="text-sm text-gray-600">
                  Select the analyst you'd like to meet with
                </p>
              </div>

              {analysts.length === 0 ? (
                <div className="bg-white border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">No analysts available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {analysts.map((analyst) => (
                    <div
                      key={analyst._id}
                      onClick={() => handleSelectAnalyst(analyst)}
                      className="bg-white border border-gray-200 p-8 hover:border-black transition-all cursor-pointer group"
                    >
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          {analyst.photoUrl ? (
                            <img
                              src={analyst.photoUrl}
                              alt={analyst.name}
                              className="w-16 h-16 object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-2xl font-light text-black">
                              {analyst.name}
                            </h3>
                            {analyst.title && (
                              <p className="text-xs text-gray-500 tracking-wider uppercase mt-1">{analyst.title}</p>
                            )}
                          </div>
                        </div>
                        
                        {analyst.bio && (
                          <p className="text-sm text-gray-600 leading-relaxed">{analyst.bio}</p>
                        )}
                        
                        {analyst.availabilitySlots && analyst.availabilitySlots.length > 0 && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2 tracking-wider uppercase">Available Times:</p>
                            <div className="flex flex-wrap gap-2">
                              {analyst.availabilitySlots.slice(0, 3).map((slot: any, idx: number) => (
                                <span 
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1"
                                >
                                  {DAYS_OF_WEEK[slot.dayOfWeek]} {slot.startTime}-{slot.endTime}
                                </span>
                              ))}
                              {analyst.availabilitySlots.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{analyst.availabilitySlots.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-black font-bold group-hover:gap-2 transition-all pt-4">
                          <span className="text-xs tracking-[0.3em] uppercase">Select</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date */}
          {currentStep === 2 && selectedAnalyst && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Analysts
                </button>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Selected Analyst:</p>
                  <p className="text-lg font-bold text-gray-900">{selectedAnalyst.name}</p>
                  {selectedAnalyst.title && (
                    <p className="text-sm text-gray-600">{selectedAnalyst.title}</p>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select a Date
                </h2>
                <p className="text-gray-600">
                  Choose a convenient date for your consultation
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  availableDates={availableDates}
                />

                {selectedDate && (
                  <div className="mt-6">
                    <Button
                      onClick={handleDateSelected}
                      className="w-full"
                    >
                      Continue to Time Selection
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {currentStep === 3 && selectedDate && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Date Selection
                </button>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Booking with:</p>
                  <p className="text-lg font-bold text-gray-900">{selectedAnalyst?.name}</p>
                  <p className="text-sm text-gray-600">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select a Time
                </h2>
                <p className="text-gray-600">
                  Choose an available time slot
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No available slots for this date</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                            selectedSlot === slot
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 hover:border-gray-300 text-gray-900"
                          }`}
                        >
                          <Clock className="w-4 h-4 inline mr-2" />
                          {slot}
                        </button>
                      ))}
                    </div>

                    {selectedSlot && (
                      <Button
                        onClick={handleTimeSelected}
                        className="w-full"
                      >
                        Continue to Your Information
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Time Selection
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Information
                </h2>
                <p className="text-gray-600">
                  Fill in your details to complete the booking
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Analyst:</strong> {selectedAnalyst?.name}</p>
                    <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                    <p><strong>Time:</strong> {selectedSlot}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />

                  <Input
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />

                  <Input
                    label="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                  />

                  <Textarea
                    label="Reason for Meeting"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="What would you like to discuss?"
                    rows={4}
                  />

                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.email || submitting}
                    className="w-full"
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
