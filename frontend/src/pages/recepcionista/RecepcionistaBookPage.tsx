import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Paciente {
  pacienteId: string;
  nombre: string;
  email: string;
  folio: string;
}

interface Medico {
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

type FormStep = "paciente" | "medico" | "fecha-hora";

export default function RecepcionistaBookPage() {
  const [step, setStep] = useState<FormStep>("paciente");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState("");

  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [motivo, setMotivo] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Cargar médicos inicialmente
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await api.get("/appointments/doctors");
        setMedicos(response.data || []);
      } catch (error: any) {
        toast.error("Error al cargar médicos");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []);

  // Buscar pacientes
  const handleSearchPaciente = async (query: string) => {
    setSearchPaciente(query);
    if (query.length < 2) {
      setPacientes([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/patient/search?q=${query}`);
      setPacientes(response.data?.pacientes || []);
    } catch (error: any) {
      toast.error("Error al buscar pacientes");
    } finally {
      setSearching(false);
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (!selectedMedico) return;

    setLoadingSlots(true);
    try {
      const response = await api.get(
        `/appointments/doctors/${selectedMedico.medicoId}/available?fecha=${date}`
      );
      setTimeSlots(response.data || []);
      setSelectedTime("");
    } catch (error: any) {
      toast.error("Error al cargar horarios disponibles");
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedPaciente || !selectedMedico || !selectedDate || !selectedTime || !motivo.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (motivo.trim().length < 3) {
      toast.error("El motivo debe tener al menos 3 caracteres");
      return;
    }

    setBookingLoading(true);
    try {
      await api.post("/appointments/book", {
        pacienteId: selectedPaciente.pacienteId,
        medicoId: selectedMedico.medicoId,
        fechaHora: selectedTime,
        motivo: motivo.trim(),
      });
      toast.success("¡Cita agendada exitosamente!");
      
      // Reset form
      setStep("paciente");
      setSelectedPaciente(null);
      setSelectedMedico(null);
      setSelectedDate("");
      setTimeSlots([]);
      setSelectedTime("");
      setMotivo("");
      setSearchPaciente("");
    } catch (error: any) {
      console.error("Error al agendar:", error);
      const errorMsg = error.response?.data?.message || "Error al agendar la cita";
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="recepcionista">
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recepcionista">
      <Header title="Nueva Cita" subtitle="Agenda una cita para un paciente" />

      <div className="max-w-2xl">
        {/* Paso 1: Seleccionar Paciente */}
        {step === "paciente" && (
          <section className="card-shell">
            <h2 className="mb-4 text-lg font-bold">1. Selecciona un Paciente</h2>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold">Buscar paciente</label>
              <input
                type="text"
                placeholder="Nombre, email, folio o teléfono..."
                value={searchPaciente}
                onChange={(e) => handleSearchPaciente(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
                <span>Buscando...</span>
              </div>
            ) : pacientes.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pacientes.map((paciente) => (
                  <button
                    key={paciente.pacienteId}
                    onClick={() => {
                      setSelectedPaciente(paciente);
                      setStep("medico");
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    <p className="font-semibold">{paciente.nombre}</p>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>{paciente.email}</span>
                      <span>Folio: {paciente.folio}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchPaciente ? (
              <p className="py-8 text-center text-slate-500">No se encontraron pacientes</p>
            ) : (
              <p className="py-8 text-center text-slate-500">Comienza a escribir para buscar un paciente</p>
            )}
          </section>
        )}

        {/* Paso 2: Seleccionar Médico */}
        {step === "medico" && selectedPaciente && (
          <section className="card-shell">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">2. Selecciona un Médico</h2>
              <button
                onClick={() => setStep("paciente")}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Cambiar paciente
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Paciente: <span className="font-semibold">{selectedPaciente.nombre}</span>
            </p>

            <div className="grid grid-cols-1 gap-3">
              {medicos.map((medico) => (
                <button
                  key={medico.medicoId}
                  onClick={() => {
                    setSelectedMedico(medico);
                    setStep("fecha-hora");
                  }}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  <p className="font-semibold">{medico.nombre}</p>
                  <p className="text-sm text-slate-600">{medico.especialidad}</p>
                  <p className="text-xs text-slate-500">Costo: ${Number(medico.costoConsulta).toFixed(2)}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Paso 3: Seleccionar Fecha y Hora */}
        {step === "fecha-hora" && selectedPaciente && selectedMedico && (
          <section className="card-shell">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">3. Selecciona Fecha y Hora</h2>
              <button
                onClick={() => setStep("medico")}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Cambiar médico
              </button>
            </div>

            <div className="mb-4 space-y-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Paciente:</span> {selectedPaciente.nombre}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Médico:</span> {selectedMedico.nombre} ({selectedMedico.especialidad})
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">Hora</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
                      <span>Cargando horarios...</span>
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="">-- Selecciona una hora --</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.hora} value={slot.hora}>
                          {slot.displayTime}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-red-600">No hay horarios disponibles para esta fecha</p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">Motivo de la consulta</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describe el motivo de la consulta..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">{motivo.length} caracteres (mínimo 3)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep("medico")}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
                >
                  Atrás
                </button>
                <button
                  onClick={handleBook}
                  disabled={bookingLoading || !selectedTime || motivo.trim().length < 3}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Agendando...
                    </span>
                  ) : (
                    "Agendar Cita"
                  )}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
