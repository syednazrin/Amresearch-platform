"use client";

import { useState, useEffect } from "react";
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
}

export default function Calendar({ selectedDate, onSelectDate, availableDates = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  
  // Create array of empty cells for days before month starts
  const emptyDays = Array(startDayOfWeek).fill(null);
  
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };
  
  const isDateAvailable = (date: Date) => {
    return availableDates.some((availableDate) => 
      format(availableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };
  
  const isPastDate = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        
        {daysInMonth.map((day) => {
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isAvailable = isDateAvailable(day);
          const isPast = isPastDate(day);
          const isDisabled = isPast || !isAvailable;
          
          return (
            <button
              key={day.toString()}
              onClick={() => !isDisabled && onSelectDate(day)}
              disabled={isDisabled}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-all",
                isSelected && "bg-primary text-white",
                !isSelected && !isDisabled && "hover:bg-gray-100 text-gray-900",
                isDisabled && "text-gray-300 cursor-not-allowed",
                !isSameMonth(day, currentMonth) && "text-gray-400"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
