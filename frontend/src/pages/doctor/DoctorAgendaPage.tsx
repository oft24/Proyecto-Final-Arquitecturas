import { useEffect, useState } from "react";
import { Loader2, Clock, User, Phone, FileText } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { Calendar } from "../../components/calendar/Calendar";
import { AppointmentCard } from "../../components/cards/AppointmentCard";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Appointment {
  citaId: string;
  hora: string;
  fechaHora: string;
  paciente: string;
  pacienteId: string;
  email: string;
  telefono: string;
  motivo: string;
  estado: "programada" | "completada" | "cancelada";
  duracion: number;
}

interface ScheduleData {
  medico: {
    nombre: string;
    especialidad: string;
  };
  horarioLaboral: Record<string, any>;
  citasPorFecha: Record<string, any[]>;
  totalCitas: number;
}

export default function DoctorAgendaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const appointmentDates = schedule
    ? Object.keys(schedule.citasPorFecha)
    : [];

  // Cargar programación del médico
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get("/doctor/schedule");
        setSchedule(response.data);
      } catch (error: any) {
        console.error("Error cargando horario:", error);
        toast.error("Error al cargar el horario");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Cargar citas del día seleccionado
  useEffect(() => {
    const loadAppointments = async () => {
      if (!schedule) return;

      setLoadingAppointments(true);
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const response = await api.get(
          `/doctor/appointments/by-date?fecha=${dateStr}`
        );
        setAppointments(response.data.citas || []);
      } catch (error: any) {
        console.error("Error cargando citas:", error);
        toast.error("Error al cargar citas del día");
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [selectedDate, schedule]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando agenda...</span>
        </div>
      </DashboardLayout>
    );
  }

  const dateFormatted = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <Header title="Mi Agenda" subtitle="Gestiona tus citas y horarios" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
        {/* Sidebar - Calendario */}
        <section>
          <Calendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            appointmentDates={appointmentDates}
          />
        </section>

        {/* Main - Citas del día */}
        <section className="card-shell p-4">
          <div className="mb-4">
            <h3 className="mb-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
              Agenda del Día
            </h3>
            <p className="text-sm text-slate-600 capitalize">{dateFormatted}</p>
          </div>

          {loadingAppointments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-slate-600">
                Cargando citas...
              </span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No hay citas programadas</p>
              <p className="text-sm text-slate-400">
                para {dateFormatted}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.citaId}
                  className={`rounded-lg border p-3 ${
                    appointment.estado === "cancelada"
                      ? "border-red-200 bg-red-50"
                      : appointment.estado === "completada"
                      ? "border-green-200 bg-green-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-600" />
                      <span className="font-semibold text-slate-900">
                        {appointment.hora}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          appointment.estado === "cancelada"
                            ? "bg-red-200 text-red-700"
                            : appointment.estado === "completada"
                            ? "bg-green-200 text-green-700"
                            : "bg-blue-200 text-blue-700"
                        }`}
                      >
                        {appointment.estado.charAt(0).toUpperCase() +
                          appointment.estado.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {appointment.duracion} min
                    </span>
                  </div>

                  <div className="space-y-2 ml-7">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="font-medium text-slate-900">
                        {appointment.paciente}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">
                        {appointment.telefono}
                      </span>
                    </div>

                    {appointment.motivo && (
                      <div className="flex gap-2 mt-2">
                        <FileText className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">
                          {appointment.motivo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded px-2 py-1 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50">
                      Ver Expediente
                    </button>
                    {appointment.estado === "programada" && (
                      <>
                        <button className="flex-1 rounded px-2 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700">
                          Completar
                        </button>
                        <button className="flex-1 rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumen del día */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-xs text-slate-600">Total Citas</p>
                <p className="text-xl font-bold text-blue-600">
                  {appointments.length}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-xs text-slate-600">Completadas</p>
                <p className="text-xl font-bold text-green-600">
                  {appointments.filter((a) => a.estado === "completada").length}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-center">
                <p className="text-xs text-slate-600">Pendientes</p>
                <p className="text-xl font-bold text-yellow-600">
                  {
                    appointments.filter((a) => a.estado === "programada")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

