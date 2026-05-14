import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Loader2, Search, User } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

interface Medico {
  medicoId: string;
  nombre: string;
  especialidad: string;
  costoConsulta: number;
}

interface Paciente {
  pacienteId: string;
  nombre: string;
  email: string;
  folio: string;
  telefono?: string;
}

interface Slot {
  hora: string;
  displayTime: string;
}

type Step = 1 | 2 | 3 | 4;

export default function RecepcionistaAgendarPage() {
  const navigate = useNavigate();

  // Steps: 1=buscar paciente, 2=elegir médico, 3=elegir fecha/hora, 4=confirmar
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 - Paciente
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Step 2 - Médico
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Medico | null>(null);

  // Step 3 - Fecha y hora
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSeleccionado, setSlotSeleccionado] = useState<Slot | null>(null);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // Step 4 - Motivo
  const [motivo, setMotivo] = useState("");

  // Cargar médicos al montar
  useEffect(() => {
    api.get("/appointments/doctors").then(({ data }) => setMedicos(data));
  }, []);

  // Buscar pacientes con debounce automático al escribir
  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      setMostrarSugerencias(false);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const { data } = await api.get(`/patient/search?q=${encodeURIComponent(busqueda)}`);
        setResultados(data.pacientes);
        setMostrarSugerencias(true);
      } catch {
        toast.error("Error al buscar pacientes");
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const seleccionarPaciente = (p: Paciente) => {
    setPacienteSeleccionado(p);
    setBusqueda(p.nombre);
    setMostrarSugerencias(false);
    setResultados([]);
  };

  // Cargar slots disponibles
  const cargarSlots = async () => {
    if (!medicoSeleccionado || !fecha) return;
    setCargandoSlots(true);
    setSlotSeleccionado(null);
    try {
      const { data } = await api.get(
        `/appointments/doctors/${medicoSeleccionado.medicoId}/available?fecha=${fecha}`
      );
      setSlots(data);
    } catch {
      toast.error("Error al cargar horarios disponibles");
    } finally {
      setCargandoSlots(false);
    }
  };

  useEffect(() => {
    if (fecha && medicoSeleccionado) cargarSlots();
  }, [fecha, medicoSeleccionado]);

  // Confirmar y crear cita
  const confirmarCita = async () => {
    if (!pacienteSeleccionado || !medicoSeleccionado || !slotSeleccionado || !motivo.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/appointments/book", {
        pacienteId: pacienteSeleccionado.pacienteId,
        medicoId: medicoSeleccionado.medicoId,
        fechaHora: slotSeleccionado.hora,
        motivo,
      });
      toast.success(`Cita agendada para ${pacienteSeleccionado.nombre}`);
      navigate("/recepcionista/citas");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agendar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  const hoy = new Date().toISOString().split("T")[0];

  const stepLabel = ["Buscar Paciente", "Seleccionar Médico", "Elegir Horario", "Confirmar"];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/recepcionista/dashboard")}
          className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agendar Cita</h1>
          <p className="text-sm text-slate-500">Registra una nueva cita médica</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {stepLabel.map((label, i) => {
          const num = (i + 1) as Step;
          const active = step === num;
          const done = step > num;
          return (
            <div key={num} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                done ? "bg-emerald-600 text-white" : active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {done ? "✓" : num}
              </div>
              <span className={`hidden text-xs sm:block ${active ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                {label}
              </span>
              {i < 3 && <div className="h-px w-6 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      <div className="mx-auto max-w-2xl">

        {/* STEP 1: Buscar paciente */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-800">Buscar Paciente</h2>
            </div>

            <div className="relative mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre, email, folio o teléfono
              </label>
              <div className="relative">
                <Input
                  placeholder="Escribe para buscar..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    if (pacienteSeleccionado && e.target.value !== pacienteSeleccionado.nombre) {
                      setPacienteSeleccionado(null);
                    }
                  }}
                  onFocus={() => resultados.length > 0 && setMostrarSugerencias(true)}
                  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                  className="pr-8"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {buscando ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : busqueda.length >= 2 ? (
                    <Search className="h-4 w-4 text-slate-400" />
                  ) : null}
                </div>
              </div>

              {/* Dropdown de sugerencias */}
              {mostrarSugerencias && resultados.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {resultados.map((p) => (
                    <li key={p.pacienteId}>
                      <button
                        type="button"
                        onMouseDown={() => seleccionarPaciente(p)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.nombre}</p>
                          <p className="text-xs text-slate-400">{p.email} · Folio: {p.folio}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Sin resultados */}
              {mostrarSugerencias && resultados.length === 0 && !buscando && busqueda.length >= 2 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                  <p className="text-sm text-slate-400">No se encontraron pacientes con "{busqueda}"</p>
                </div>
              )}
            </div>

            {/* Paciente seleccionado */}
            {pacienteSeleccionado && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {pacienteSeleccionado.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">{pacienteSeleccionado.nombre}</p>
                  <p className="text-xs text-emerald-600">{pacienteSeleccionado.email} · Folio: {pacienteSeleccionado.folio}</p>
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!pacienteSeleccionado}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* STEP 2: Seleccionar médico */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-800">Seleccionar Médico</h2>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Paciente: <strong>{pacienteSeleccionado?.nombre}</strong>
            </p>
            <div className="space-y-2">
              {medicos.map((m) => (
                <button
                  key={m.medicoId}
                  onClick={() => setMedicoSeleccionado(m)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50 ${
                    medicoSeleccionado?.medicoId === m.medicoId ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                  }`}
                >
                  <p className="font-medium text-slate-800">{m.nombre}</p>
                  <p className="text-xs text-slate-500">{m.especialidad} · ${Number(m.costoConsulta).toFixed(2)}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => setStep(1)} className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                Atrás
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!medicoSeleccionado}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Fecha y hora */}
        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-800">Elegir Fecha y Horario</h2>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Médico: <strong>{medicoSeleccionado?.nombre}</strong> · {medicoSeleccionado?.especialidad}
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
              <Input type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>

            {fecha && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  <Clock className="mr-1 inline h-4 w-4" /> Horarios disponibles
                </label>
                {cargandoSlots ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando horarios...
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay horarios disponibles para esta fecha</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.hora}
                        onClick={() => setSlotSeleccionado(s)}
                        className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                          slotSeleccionado?.hora === s.hora
                            ? "border-emerald-500 bg-emerald-600 text-white"
                            : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                        }`}
                      >
                        {s.displayTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                Atrás
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!slotSeleccionado}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmar */}
        {step === 4 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Confirmar Cita</h2>

            <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Paciente</span>
                <span className="font-medium text-slate-800">{pacienteSeleccionado?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Médico</span>
                <span className="font-medium text-slate-800">{medicoSeleccionado?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Especialidad</span>
                <span className="text-slate-700">{medicoSeleccionado?.especialidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha y Hora</span>
                <span className="font-medium text-slate-800">
                  {new Date(slotSeleccionado!.hora).toLocaleDateString("es-ES", {
                    day: "2-digit", month: "long", year: "numeric",
                  })} · {slotSeleccionado?.displayTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Costo</span>
                <span className="font-medium text-emerald-700">${Number(medicoSeleccionado?.costoConsulta).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Motivo de consulta <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describe el motivo de la consulta..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(3)} className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                Atrás
              </Button>
              <Button
                onClick={confirmarCita}
                disabled={isLoading || !motivo.trim()}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isLoading ? "Agendando..." : "Confirmar Cita"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
