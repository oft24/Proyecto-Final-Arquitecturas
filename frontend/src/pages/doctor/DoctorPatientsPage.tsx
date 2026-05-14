import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Loader2,
  Mail,
  Phone,
  Search,
  Stethoscope,
  User2,
  X,
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Patient {
  pacienteId: string;
  nombre: string;
  email: string;
  folio: string;
  telefono: string;
  fechaNacimiento: string;
  ultimaCita?: string;
  totalCitas?: number;
}

type EstadoCita = "programada" | "completada" | "cancelada";

interface CitaHist {
  citaId: string;
  fechaHora: string;
  estado: EstadoCita;
  motivo: string | null;
  motivoCancelacion: string | null;
  duracionMin: number;
}

interface ExpedienteHist {
  expedienteId: string;
  citaId: string | null;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string | null;
  createdAt: string;
}

interface Historial {
  paciente: Patient;
  citas: CitaHist[];
  expedientes: ExpedienteHist[];
}

const ESTADO_BADGE: Record<EstadoCita, string> = {
  programada: "bg-blue-100 text-blue-700",
  completada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [historial, setHistorial] = useState<Historial | null>(null);
  const [loadingHist, setLoadingHist] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/doctor/pacientes");
        if (!cancel) setPatients(data.pacientes || []);
      } catch (error: any) {
        if (!cancel) toast.error(error?.response?.data?.message || "Error al cargar tus pacientes");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // Filtrado en cliente sobre la lista propia
  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.folio.toLowerCase().includes(q) ||
        (p.telefono ?? "").toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const abrirHistorial = async (pacienteId: string) => {
    setLoadingHist(true);
    setHistorial({ paciente: {} as Patient, citas: [], expedientes: [] });
    try {
      const { data } = await api.get(`/doctor/pacientes/${pacienteId}/historial`);
      setHistorial(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al cargar historial");
      setHistorial(null);
    } finally {
      setLoadingHist(false);
    }
  };

  const cerrarHistorial = () => setHistorial(null);

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando pacientes...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Mis Pacientes" subtitle="Pacientes que has atendido o tienes en agenda" />

      <section className="card-shell p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, folio o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {filteredPatients.length} {filteredPatients.length === 1 ? "paciente" : "pacientes"}
          </span>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
            <User2 className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {patients.length === 0 ? "Aún no tienes pacientes asignados" : "Sin resultados para tu búsqueda"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {patients.length === 0
                ? "Cuando atiendas tu primera cita el paciente aparecerá aquí."
                : "Prueba con otro nombre, folio o teléfono."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredPatients.map((patient) => (
              <article
                key={patient.pacienteId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
                    {getInitials(patient.nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{patient.nombre}</p>
                    <p className="truncate text-xs text-slate-500">
                      {calculateAge(patient.fechaNacimiento)} años · Folio {patient.folio}
                    </p>
                  </div>
                </div>

                <div className="mb-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span>{patient.telefono}</span>
                  </div>
                  {patient.ultimaCita && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 flex-shrink-0" />
                      <span>
                        Última: {formatFecha(patient.ultimaCita)}
                        {patient.totalCitas ? ` · ${patient.totalCitas} cita${patient.totalCitas !== 1 ? "s" : ""}` : ""}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => abrirHistorial(patient.pacienteId)}
                  className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <ClipboardList className="h-3.5 w-3.5" /> Ver Historial
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal historial */}
      {historial && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">Historial clínico</p>
                  <p className="font-bold leading-tight">{historial.paciente?.nombre || "Cargando..."}</p>
                </div>
              </div>
              <button onClick={cerrarHistorial} className="rounded-lg p-1 transition hover:bg-blue-800/40">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              {loadingHist ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" /> Cargando historial...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Datos paciente */}
                  {historial.paciente?.email && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <p><span className="text-slate-500">Email:</span> <strong>{historial.paciente.email}</strong></p>
                        <p><span className="text-slate-500">Tel:</span> <strong>{historial.paciente.telefono}</strong></p>
                        <p><span className="text-slate-500">Folio:</span> <strong>{historial.paciente.folio}</strong></p>
                        <p><span className="text-slate-500">Edad:</span> <strong>{calculateAge(historial.paciente.fechaNacimiento)} años</strong></p>
                      </div>
                    </div>
                  )}

                  {/* Citas */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <CalendarDays className="h-4 w-4 text-blue-600" /> Citas ({historial.citas.length})
                    </h4>
                    {historial.citas.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                        Sin citas registradas
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {historial.citas.map((c) => (
                          <li key={c.citaId} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900">{formatFecha(c.fechaHora)}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {c.motivo || "Sin motivo especificado"}
                                {c.estado === "cancelada" && c.motivoCancelacion ? ` · Cancelación: ${c.motivoCancelacion}` : ""}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${ESTADO_BADGE[c.estado]}`}>
                              {c.estado}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Expedientes */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <FileText className="h-4 w-4 text-emerald-600" /> Notas de consulta ({historial.expedientes.length})
                    </h4>
                    {historial.expedientes.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                        Sin notas registradas
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {historial.expedientes.map((e) => (
                          <li key={e.expedienteId} className="rounded-lg border border-slate-200 p-4 text-sm">
                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                              <Stethoscope className="h-3.5 w-3.5" />
                              <span>{formatFecha(e.createdAt)}</span>
                            </div>
                            <div className="space-y-2">
                              <p><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Motivo:</span> {e.motivoConsulta}</p>
                              <p><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diagnóstico:</span> {e.diagnostico}</p>
                              <p><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tratamiento:</span> {e.tratamiento}</p>
                              {e.observaciones && (
                                <p><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Observaciones:</span> {e.observaciones}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
