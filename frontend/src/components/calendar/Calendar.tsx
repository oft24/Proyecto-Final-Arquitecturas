import { FC, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointmentDates: string[]; // Array de fechas en formato YYYY-MM-DD que tienen citas
}

export const Calendar: FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  appointmentDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasAppointment = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointmentDates.includes(dateStr);
  };

  const days = [];
  const totalDays = daysInMonth(currentMonth);
  const firstDay = firstDayOfMonth(currentMonth);

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    days.push(day);
  }

  const monthYear = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 capitalize">
          {monthYear}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={previousMonth}
            className="rounded p-1 hover:bg-slate-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <button
            onClick={nextMonth}
            className="rounded p-1 hover:bg-slate-100"
            aria-label="Próximo mes"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <div key={idx}>
            {day === null ? (
              <div className="h-10 rounded" />
            ) : (
              <button
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setDate(day);
                  onDateChange(newDate);
                }}
                className={`w-full h-10 rounded text-sm font-medium transition-colors ${
                  isSelected(day)
                    ? "bg-blue-600 text-white"
                    : isToday(day)
                    ? "bg-blue-100 text-blue-600 border border-blue-300"
                    : hasAppointment(day)
                    ? "bg-green-50 text-slate-900 border border-green-300"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {day}
                  {hasAppointment(day) && (
                    <div className="h-1 w-1 bg-green-600 rounded-full mt-0.5" />
                  )}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-50 border border-green-300"></div>
          <span>Tiene citas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-100 border border-blue-300"></div>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
};
