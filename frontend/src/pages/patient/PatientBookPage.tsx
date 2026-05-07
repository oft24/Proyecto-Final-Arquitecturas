import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Doctor {
  medicoId: string;
  nombre: string;
  especialidad: string;
  costoConsulta: number;
  fotoUrl?: string;
}

interface TimeSlot {
  hora: string;
  displayTime: string;
}

export default function PatientBookPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [motivo, setMotivo] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log("Cargando médicos...");
        const response = await api.get("/appointments/doctors");
        console.log("Respuesta de médicos:", response.data);
        
        if (Array.isArray(response.data)) {
          setDoctors(response.data);
          if (response.data.length === 0) {
            setError("No hay médicos registrados en el sistema");
          }
        } else {
          console.error("La respuesta no es un array:", response.data);
          setError("Error: respuesta inválida del servidor");
        }
      } catch (error: any) {
        console.error("Error cargando médicos:", error);
        const errorMsg = error.response?.data?.message || error.message || "Error al cargar los médicos disponibles";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (!selectedDoctor) return;

    setLoadingSlots(true);
    try {
      console.log(`Cargando horarios para ${selectedDoctor.medicoId} en ${date}`);
      const response = await api.get(
        `/appointments/doctors/${selectedDoctor.medicoId}/available?fecha=${date}`
      );
      console.log("Horarios disponibles:", response.data);
      setTimeSlots(response.data || []);
      setSelectedTime("");
    } catch (error: any) {
      console.error("Error al cargar horarios:", error);
      const errorMsg = error.response?.data?.message || "Error al cargar horarios disponibles";
      toast.error(errorMsg);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !motivo.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (motivo.trim().length < 3) {
      toast.error("El motivo debe tener al menos 3 caracteres");
      return;
    }

    setBookingLoading(true);
    try {
      console.log("Agendando cita...", {
        pacienteId: user?.usuarioId,
        medicoId: selectedDoctor.medicoId,
        fechaHora: selectedTime,
        motivo: motivo.trim(),
      });

      await api.post("/appointments/book", {
        pacienteId: user?.usuarioId,
        medicoId: selectedDoctor.medicoId,
        fechaHora: selectedTime,
        motivo: motivo.trim(),
      });
      toast.success("¡Cita agendada exitosamente!");
      setSelectedDoctor(null);
      setSelectedDate("");
      setTimeSlots([]);
      setSelectedTime("");
      setMotivo("");
    } catch (error: any) {
      console.error("Error al agendar:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Error al agendar la cita";
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Agendar Nueva Cita" subtitle="Cargando médicos disponibles..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2">Cargando médicos...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <DashboardLayout>
        <Header title="Agendar Nueva Cita" subtitle="Error al cargar médicos" />
        <div className="card-shell max-w-2xl p-6">
          <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Reintentar →
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Si no hay un doctor seleccionado, mostrar lista de doctores
  if (!selectedDoctor) {
    return (
      <DashboardLayout>
        <Header title="Agendar Nueva Cita" subtitle="Selecciona un medico especialista disponible" />
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {doctors.length === 0 ? (
            <div className="col-span-full">
              <p className="text-center text-slate-500">No hay médicos disponibles en este momento</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <article key={doctor.medicoId} className="card-shell p-4 hover:shadow-lg transition">
                <p className="text-2xl font-bold">{doctor.nombre}</p>
                <p className="text-sm text-slate-500">{doctor.especialidad}</p>
                <p className="my-1 text-xs text-slate-600">
                  Costo de consulta: ${Number(doctor.costoConsulta).toFixed(2)}
                </p>
                <p className="my-3 text-sm">Selecciona este médico para agendar una cita</p>
                <button
                  onClick={() => setSelectedDoctor(doctor)}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Seleccionar y Agendar
                </button>
              </article>
            ))
          )}
        </section>
      </DashboardLayout>
    );
  }

  // Si hay un doctor seleccionado, mostrar formulario de agendamiento
  return (
    <DashboardLayout>
      <Header title={`Agendar con ${selectedDoctor.nombre}`} subtitle={selectedDoctor.especialidad} />
      <section className="card-shell max-w-2xl p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Volver a seleccionar médico
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Selecciona una fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="mb-2 block text-sm font-semibold">Horarios disponibles</label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm">Cargando horarios...</span>
                </div>
              ) : timeSlots.length === 0 ? (
                <p className="text-sm text-slate-500">No hay horarios disponibles para esta fecha</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.hora}
                      onClick={() => setSelectedTime(slot.hora)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${
                        selectedTime === slot.hora
                          ? "border-emerald-600 bg-emerald-100 text-emerald-900"
                          : "border-slate-300 hover:border-emerald-600"
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTime && (
            <div>
              <label className="mb-2 block text-sm font-semibold">Motivo de la consulta</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describe brevemente el motivo de tu consulta"
                minLength={3}
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={4}
              />
              <p className="text-xs text-slate-500">{motivo.length}/200 caracteres</p>
            </div>
          )}

          {motivo && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
              <p className="text-sm">
                <strong>Resumen de tu cita:</strong>
              </p>
              <p className="text-sm mt-2">Médico: <strong>{selectedDoctor.nombre}</strong></p>
              <p className="text-sm">Especialidad: <strong>{selectedDoctor.especialidad}</strong></p>
              <p className="text-sm">
                Fecha: <strong>{new Date(selectedDate).toLocaleDateString("es-ES")}</strong>
              </p>
              <p className="text-sm">Hora: <strong>{selectedTime.split("T")[1]?.slice(0, 5) || selectedTime}</strong></p>
              <p className="text-sm">Costo: <strong>${Number(selectedDoctor.costoConsulta).toFixed(2)}</strong></p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={!motivo || bookingLoading}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {bookingLoading ? "Agendando..." : "Agendar Cita"}
            </button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
