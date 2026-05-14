import { useEffect, useState } from "react";
import {
  CalendarDays, ChevronDown, ChevronUp, Loader2, Search, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";

interface Paciente {
  pacienteId: string;
  nombre: string;
  email: string;
  folio: string;
  telefono: string;
  fechaNacimiento: string;
}

interface Cita {
  citaId: string;
  fechaHora: string;
  estado: "programada" | "completada" | "cancelada";
  motivo: string | null;
  motivoCancelacion: string | null;
  duracionMin: number;
  medico: string;
  especialidad: string;
  costoConsulta: number;
}

export default function RecepcionistaPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Modal historial
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [historial, setHistorial] = useState<Cita[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "programada" | "completada" | "cancelada">("todas");
  const [expandida, setExpandida] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      const { data } = await api.get("/patient/list?page=1&limit=100");
      setPacientes(data.pacientes || []);
    } catch {
      toast.error("Error al cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchPacientes();
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/patient/search?q=${encodeURIComponent(query)}`);
      setPacientes(data.pacientes || []);
    } catch {
      toast.error("Error al buscar pacientes");
    } finally {
      setSearching(false);
    }
  };

  const abrirHistorial = async (p: Paciente) => {
    setPacienteSeleccionado(p);
    setHistorial([]);
    setFiltroEstado("todas");
    setExpandida(null);
    setLoadingHistorial(true);
    try {
      const { data } = await api.get(`/patient/${p.pacienteId}/history`);
      setHistorial(data);
    } catch {
      toast.error("Error al cargar el historial de citas");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const calcularEdad = (fechaNac: string) => {
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "UTC",
    });

  const esFutura = (f: string) => new Date(f) > new Date();

  const estadoBadge = (estado: string, fecha: string) => {
    if (estado === "programada" && esFutura(fecha)) {
      return "bg-blue-100 text-blue-700";
    }
    const map: Record<string, string> = {
      programada: "bg-amber-100 text-amber-700",
      completada: "bg-emerald-100 text-emerald-700",
      cancelada: "bg-red-100 text-red-700",
    };
    return map[estado] ?? "bg-slate-100 text-slate-600";
  };

  const estadoLabel = (estado: string, fecha: string) => {
    if (estado === "programada" && esFutura(fecha)) return "Próxima";
    const map: Record<string, string> = {
      programada: "Pendiente",
      completada: "Completada",
      cancelada: "Cancelada",
    };
    return map[estado] ?? estado;
  };

  const citasFiltradas = historial.filter(
    (c) => filtroEstado === "todas" || c.estado === filtroEstado
  );

  const proximas = historial.filter((c) => c.estado === "programada" && esFutura(c.fechaHora));
  const pasadas = historial.filter((c) => c.estado !== "programada" || !esFutura(c.fechaHora));

  return (
    <DashboardLayout>
      <Header title="Pacientes" subtitle={currentDate} />

      {/* Modal historial */}
      {pacienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">
            {/* Header modal */}
            <div className="flex items-center justify-between rounded-t-2xl bg-emerald-600 px-6 py-4 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold">
                  {getInitials(pacienteSeleccionado.nombre)}
                </div>
                <div>
                  <p className="font-semibold">{pacienteSeleccionado.nombre}</p>
                  <p className="text-xs text-emerald-200">
                    Folio: {pacienteSeleccionado.folio} · {calcularEdad(pacienteSeleccionado.fechaNacimiento)} años
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPacienteSeleccionado(null)}
                className="rounded-lg p-1 hover:bg-emerald-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resumen rápido */}
            {!loadingHistorial && (
              <div className="grid grid-cols-3 gap-3 border-b border-slate-100 px-6 py-3 shrink-0">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-800">{historial.length}</p>
                  <p className="text-xs text-slate-500">Total citas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600">{proximas.length}</p>
                  <p className="text-xs text-slate-500">Próximas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">
                    {historial.filter((c) => c.estado === "completada").length}
                  </p>
                  <p className="text-xs text-slate-500">Completadas</p>
                </div>
              </div>
            )}

            {/* Filtros de estado */}
            {!loadingHistorial && historial.length > 0 && (
              <div className="flex gap-1 border-b border-slate-100 px-6 py-2 shrink-0">
                {(["todas", "programada", "completada", "cancelada"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroEstado(f)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors capitalize ${
                      filtroEstado === f
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {f === "todas" ? "Todas" :
                     f === "programada" ? "Programadas" :
                     f === "completada" ? "Completadas" : "Canceladas"}
                    <span className="ml-1 opacity-70">
                      ({f === "todas" ? historial.length : historial.filter((c) => c.estado === f).length})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Lista de citas */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {loadingHistorial ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span className="ml-2 text-sm text-slate-500">Cargando historial...</span>
                </div>
              ) : citasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CalendarDays className="mb-2 h-8 w-8" />
                  <p className="text-sm">No hay citas {filtroEstado !== "todas" ? filtroEstado + "s" : ""}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {citasFiltradas.map((c) => (
                    <div
                      key={c.citaId}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                    >
                      {/* Fila principal */}
                      <button
                        onClick={() => setExpandida(expandida === c.citaId ? null : c.citaId)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <CalendarDays className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{c.medico}</p>
                            <p className="text-xs text-slate-500">{c.especialidad} · {formatFecha(c.fechaHora)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoBadge(c.estado, c.fechaHora)}`}>
                            {estadoLabel(c.estado, c.fechaHora)}
                          </span>
                          {expandida === c.citaId
                            ? <ChevronUp className="h-4 w-4 text-slate-400" />
                            : <ChevronDown className="h-4 w-4 text-slate-400" />
                          }
                        </div>
                      </button>

                      {/* Detalle expandido */}
                      {expandida === c.citaId && (
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm space-y-1">
                          {c.motivo && (
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">Motivo:</span> {c.motivo}
                            </p>
                          )}
                          {c.motivoCancelacion && (
                            <p className="text-red-600">
                              <span className="font-medium">Cancelación:</span> {c.motivoCancelacion}
                            </p>
                          )}
                          <p className="text-slate-500">
                            <span className="font-medium text-slate-700">Duración:</span> {c.duracionMin} min
                          </p>
                          {c.costoConsulta && (
                            <p className="text-slate-500">
                              <span className="font-medium text-slate-700">Costo:</span> ${Number(c.costoConsulta).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 px-6 py-3">
              <button
                onClick={() => setPacienteSeleccionado(null)}
                className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de pacientes */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Buscador */}
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, folio o teléfono..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-slate-500">Cargando pacientes...</span>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Search className="mb-3 h-10 w-10" />
            <p className="font-medium">No se encontraron pacientes</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Paciente</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Folio</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Edad</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientes.map((p) => (
                <tr key={p.pacienteId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {getInitials(p.nombre)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{p.nombre}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.folio}</td>
                  <td className="px-4 py-3 text-slate-500">{p.telefono}</td>
                  <td className="px-4 py-3 text-slate-500">{calcularEdad(p.fechaNacimiento)} años</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => abrirHistorial(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <CalendarDays className="h-3 w-3" /> Ver Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
