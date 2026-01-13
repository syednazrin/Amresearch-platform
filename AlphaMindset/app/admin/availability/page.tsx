"use client";

import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Plus, Trash2 } from "lucide-react";

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/admin/availability");
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (dayOfWeek: number) => {
    setSlots([
      ...slots,
      {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isActive: true,
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (response.ok) {
        alert("Availability settings saved successfully");
      } else {
        alert("Failed to save availability settings");
      }
    } catch (error) {
      console.error("Error saving slots:", error);
      alert("Failed to save availability settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Group slots by day of week
  const slotsByDay = DAYS_OF_WEEK.map((_, dayIndex) => ({
    day: dayIndex,
    slots: slots.filter((slot) => slot.dayOfWeek === dayIndex),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Availability Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-gray-600 mb-6">
          Set your weekly availability schedule. Times are shown in 24-hour format.
        </p>

        <div className="space-y-6">
          {slotsByDay.map(({ day, slots: daySlots }) => (
            <div key={day} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{DAYS_OF_WEEK[day]}</h3>
                <Button variant="ghost" size="sm" onClick={() => addSlot(day)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time Slot
                </Button>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-sm text-gray-500">No availability set for this day</p>
              ) : (
                <div className="space-y-3">
                  {daySlots.map((slot, slotIndex) => {
                    const globalIndex = slots.findIndex(
                      (s) => s === slot
                    );

                    return (
                      <div key={slotIndex} className="flex items-center gap-4">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(globalIndex, "startTime", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-600">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(globalIndex, "endTime", e.target.value)}
                          className="w-32"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.isActive}
                            onChange={(e) => updateSlot(globalIndex, "isActive", e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <button
                          onClick={() => removeSlot(globalIndex)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Time slots are divided into 15-minute increments</li>
          <li>Disable slots temporarily by unchecking the "Active" checkbox</li>
          <li>You can have multiple time ranges per day</li>
          <li>Make sure to save your changes before leaving this page</li>
        </ul>
      </div>
    </div>
  );
}
