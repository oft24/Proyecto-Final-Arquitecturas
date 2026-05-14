import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Loader2,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

interface Paciente {
  pacienteId: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  folio: string;
}

interface Cita {
  citaId: string;
  estado: string;
  fechaHora: string;
  motivo: string | null;
  duracionMin: number;
  paciente: Paciente;
}

interface ExpedienteForm {
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}

export default function DoctorAtenderCitaPage() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [citaActiva, setCitaActiva] = useState<Cita | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<ExpedienteForm>({
    motivoConsulta: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
  });

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const { data } = await api.get("/doctor/citas?estado=programada");
      setCitas(data);
    } catch {
      toast.error("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const abrirCita = (cita: Cita) => {
    setCitaActiva(cita);
    setForm({
      motivoConsulta: cita.motivo || "",
      diagnostico: "",
      tratamiento: "",
      observaciones: "",
    });
  };

  const cerrarModal = () => {
    setCitaActiva(null);
    setForm({ motivoConsulta: "", diagnostico: "", tratamiento: "", observaciones: "" });
  };

  const handleGuardar = async () => {
    if (!citaActiva) return;
    if (!form.motivoConsulta.trim() || !form.diagnostico.trim() || !form.tratamiento.trim()) {
      toast.error("Motivo, diagnóstico y tratamiento son obligatorios");
      return;
    }
    setGuardando(true);
    try {
      await api.post(`/doctor/citas/${citaActiva.citaId}/atender`, form);
      toast.success(`Expediente de ${citaActiva.paciente.nombre} guardado`);
      setCitas((prev) => prev.filter((c) => c.citaId !== citaActiva.citaId));
      cerrarModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar el expediente");
    } finally {
      setGuardando(false);
    }
  };

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const calcEdad = (fechaNac: string) => {
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  return (
    <DashboardLayout>
      <Header title="Atender Citas" subtitle={currentDate} />

      {/* Modal expediente */}
      {citaActiva && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Header modal */}
            <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Llenar Expediente</p>
                  <p className="text-xs text-blue-200">{citaActiva.paciente.nombre} · {formatFecha(citaActiva.fechaHora)}</p>
                </div>
              </div>
              <button onClick={cerrarModal} className="rounded-lg p-1 hover:bg-blue-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Info del paciente */}
              <div className="mb-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                  {citaActiva.paciente.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{citaActiva.paciente.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {citaActiva.paciente.email} · Tel: {citaActiva.paciente.telefono}
                  </p>
                  <p className="text-xs text-slate-500">
                    Folio: {citaActiva.paciente.folio} · {calcEdad(citaActiva.paciente.fechaNacimiento)} años
                  </p>
                </div>
              </div>

              {/* Formulario expediente */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Motivo de consulta <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.motivoConsulta}
                    onChange={(e) => setForm({ ...form, motivoConsulta: e.target.value })}
                    placeholder="Describe el motivo por el que acude el paciente..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Diagnóstico <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.diagnostico}
                    onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                    placeholder="Diagnóstico clínico del paciente..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tratamiento <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.tratamiento}
                    onChange={(e) => setForm({ ...form, tratamiento: e.target.value })}
                    placeholder="Medicamentos, indicaciones, dosis..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Observaciones <span className="text-slate-400 text-xs">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    placeholder="Notas adicionales, seguimiento, próxima cita..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="mt-5 flex gap-3">
                <Button
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardar}
                  disabled={guardando || !form.motivoConsulta.trim() || !form.diagnostico.trim() || !form.tratamiento.trim()}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {guardando ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Guardar y Completar Cita
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-sm text-slate-500">
            {citas.length} cita{citas.length !== 1 ? "s" : ""} programada{citas.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Lista de citas */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-500">Cargando citas...</span>
        </div>
      ) : citas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
          <CalendarDays className="mb-3 h-12 w-12" />
          <p className="font-medium text-slate-600">No tienes citas programadas</p>
          <p className="mt-1 text-sm">Cuando la recepcionista agende una cita aparecerá aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {citas.map((cita) => (
            <div
              key={cita.citaId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              {/* Paciente */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {cita.paciente.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{cita.paciente.nombre}</p>
                  <p className="text-xs text-slate-400">Folio: {cita.paciente.folio}</p>
                </div>
              </div>

              {/* Detalles */}
              <div className="mb-4 space-y-1 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatFecha(cita.fechaHora)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>{calcEdad(cita.paciente.fechaNacimiento)} años · {cita.paciente.telefono}</span>
                </div>
                {cita.motivo && (
                  <div className="flex items-start gap-2">
                    <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">{cita.motivo}</span>
                  </div>
                )}
              </div>

              {/* Botón atender */}
              <button
                onClick={() => abrirCita(cita)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <ClipboardList className="h-4 w-4" /> Atender y Llenar Expediente
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
