import React, { useEffect, useMemo, useState } from "react";
import { getVehicleAvailability, createOwnerPersonalUseBooking } from "../services/bookingApi";
import { toast } from "react-hot-toast";

const AvailabilityOwner = ({ isOpen, onClose, vehicle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({}); // { "YYYY-MM-DD": "booked" }
  const [loading, setLoading] = useState(false);
  const [selectionRange, setSelectionRange] = useState({ start: null, end: null });

  const months = useMemo(
    () => [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    [],
  );

  const daysOfWeek = useMemo(
    () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    [],
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Helper: Format Date to YYYY-MM-DD
  const formatDateISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // previous month fillers
    const firstDow = firstDay.getDay();
    for (let i = 0; i < firstDow; i++) {
      const prev = new Date(year, month, -firstDow + i + 1);
      days.push({
        date: prev.getDate(),
        isCurrentMonth: false,
        fullDate: prev,
      });
    }

    // current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }

    // next month fillers
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      days.push({
        date: next.getDate(),
        isCurrentMonth: false,
        fullDate: next,
      });
    }

    return days;
  };

  const fetchAvailability = async () => {
    if (!vehicle?._id) return;

    setLoading(true);
    try {
      const res = await getVehicleAvailability(vehicle._id);
      const bookingsArr = res?.data || [];
      const newBookedDates = {};

      bookingsArr.forEach((b) => {
        if (["rejected", "cancelled"].includes(b.status)) return;

        const startRaw = b.startingDate ?? b.startDate ?? b.from ?? b.start;
        const endRaw = b.endDate ?? b.to ?? b.end;

        if (!startRaw || !endRaw) return;

        const start = new Date(startRaw);
        const end = new Date(endRaw);

        let cur = new Date(start);
        while (cur <= end) {
          newBookedDates[formatDateISO(cur)] = "booked";
          cur.setDate(cur.getDate() + 1);
        }
      });

      setBookedDates(newBookedDates);
    } catch (e) {
      console.error("fetchAvailability error:", e);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailability();
      setSelectionRange({ start: null, end: null });
    }
  }, [isOpen, vehicle?._id]);

  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;

    // Prevent selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day.fullDate < today) return;

    const dateStr = formatDateISO(day.fullDate);
    if (bookedDates[dateStr] === "booked") return;

    if (!selectionRange.start || (selectionRange.start && selectionRange.end)) {
      // Start new selection
      setSelectionRange({ start: day.fullDate, end: null });
    } else {
      // Complete selection
      if (day.fullDate < selectionRange.start) {
        setSelectionRange({ start: day.fullDate, end: selectionRange.start });
      } else {
        setSelectionRange({ ...selectionRange, end: day.fullDate });
      }
    }
  };

  const isDateSelected = (date) => {
    if (!selectionRange.start) return false;
    if (selectionRange.end) {
      return date >= selectionRange.start && date <= selectionRange.end;
    }
    return date.getTime() === selectionRange.start.getTime();
  };

  const handleBlockDates = async () => {
    if (!selectionRange.start || !selectionRange.end) return;

    // Check for overlap locally first
    let cur = new Date(selectionRange.start);
    while (cur <= selectionRange.end) {
      if (bookedDates[formatDateISO(cur)] === "booked") {
        toast.error("One or more dates in range are already booked");
        return;
      }
      cur.setDate(cur.getDate() + 1);
    }

    try {
      setLoading(true);

      // For single day or multi-day, end date should be end of that day to cover full day
      const endDateTime = new Date(selectionRange.end);
      endDateTime.setHours(23, 59, 59, 999);

      await createOwnerPersonalUseBooking({
        vehicleId: vehicle._id,
        startingDate: selectionRange.start, // 00:00:00
        endDate: endDateTime // 23:59:59
      });
      toast.success("Dates blocked successfully");
      setSelectionRange({ start: null, end: null });
      await fetchAvailability();
    } catch (error) {
      console.error("Block dates error:", error);
      toast.error(error.message || "Failed to block dates");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  if (!isOpen) return null;

  const days = getDaysInMonthGrid(currentDate);

  // Stats
  const selectedCount = selectionRange.start && selectionRange.end
    ? Math.round((selectionRange.end - selectionRange.start) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 transform transition-all">
        {/* Header */}
        <div className="bg-white p-4 pb-2 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{vehicle?.title || "Availability"}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 hover:border-blue-500 hover:text-blue-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-base font-bold text-gray-800">
              {months[currentMonth]} <span className="text-blue-600">{currentYear}</span>
            </h3>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 hover:border-blue-500 hover:text-blue-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-7 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dateStr = formatDateISO(day.fullDate);
                const isBooked = bookedDates[dateStr] === "booked";
                const isSelected = isDateSelected(day.fullDate);
                const isCurrentMonth = day.isCurrentMonth;

                // Check if in past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = day.fullDate < today;

                let bgClass = "bg-white hover:bg-gray-50 border border-gray-100";
                let textClass = "text-gray-700";

                if (!isCurrentMonth) {
                  textClass = "text-gray-300";
                  bgClass = "bg-transparent border-transparent";
                } else if (isBooked) {
                  bgClass = "bg-red-50 border-red-100"; // Lite red
                  textClass = "text-red-400 cursor-not-allowed";
                } else if (isSelected) {
                  bgClass = "bg-blue-100 border-blue-200"; // Lite blue
                  textClass = "text-blue-600 font-semibold";
                } else if (isPast) {
                  textClass = "text-gray-300 cursor-not-allowed";
                  bgClass = "bg-gray-50 border-transparent";
                } else {
                  bgClass = "bg-green-50 hover:bg-green-100 border-green-100 cursor-pointer"; // Lite green
                  textClass = "text-green-700";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`
                                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                                    ${bgClass} ${textClass}
                                `}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-50 border border-green-200"></div>
              <span className="text-xs text-gray-500 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-50 border border-red-200"></div>
              <span className="text-xs text-gray-500 font-medium">Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
              <span className="text-xs text-gray-500 font-medium">Selected</span>
            </div>
          </div>

          {/* Footer / Action */}
          <div className="mt-4">
            <button
              onClick={handleBlockDates}
              disabled={!selectionRange.start || !selectionRange.end || loading}
              className={`
                        w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm
                        transition-all duration-200
                        ${(!selectionRange.start || !selectionRange.end || loading)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#0D3778] hover:bg-[#0a2b5e] hover:shadow-xl hover:-translate-y-0.5"
                }
                    `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Block Selected Range</span>
                  {selectedCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{selectedCount} days</span>}
                </>
              )}
            </button>
            <div className="text-center mt-2 text-xs text-gray-400">
              {Object.keys(bookedDates).length} days currently blocked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityOwner;
