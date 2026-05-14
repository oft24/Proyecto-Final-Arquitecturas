import { useEffect, useState } from "react";
import {
  Activity,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";

interface MedicoStats {
  medicoId: string;
  nombre: string;
  email: string;
  especialidad: string;
  costoConsulta: number;
  horario: Record<string, unknown>;
  fotoUrl: string | null;
  activo: boolean;
  createdAt: string;
  stats: {
    totalCitas: number;
    citasCompletadas: number;
    citasMes: number;
    pacientesUnicos: number;
    expedientes: number;
  };
}

type SortKey = "nombre" | "citasCompletadas" | "pacientesUnicos" | "citasMes";

export default function DirectorMedicosPage() {
  const [medicos, setMedicos] = useState<MedicoStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("todas");
  const [sortKey, setSortKey] = useState<SortKey>("citasCompletadas");
  const [sortAsc, setSortAsc] = useState(false);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    api
      .get("/director/medicos")
      .then(({ data }) => setMedicos(data.medicos))
      .catch(() => toast.error("No se pudieron cargar los médicos"))
      .finally(() => setLoading(false));
  }, []);

  const especialidades = ["todas", ...Array.from(new Set(medicos.map((m) => m.especialidad)))];

  const filtered = medicos
    .filter((m) => {
      const matchSearch =
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.especialidad.toLowerCase().includes(search.toLowerCase());
      const matchEsp =
        filterEspecialidad === "todas" || m.especialidad === filterEspecialidad;
      return matchSearch && matchEsp;
    })
    .sort((a, b) => {
      let valA: number | string;
      let valB: number | string;
      if (sortKey === "nombre") {
        valA = a.nombre;
        valB = b.nombre;
      } else {
        valA = a.stats[sortKey];
        valB = b.stats[sortKey];
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? (
        <ChevronUp className="inline h-3 w-3" />
      ) : (
        <ChevronDown className="inline h-3 w-3" />
      )
    ) : null;

  // Totales del encabezado
  const totalActivos = medicos.filter((m) => m.activo).length;
  const totalCitas = medicos.reduce((s, m) => s + m.stats.totalCitas, 0);
  const totalPacientes = medicos.reduce((s, m) => s + m.stats.pacientesUnicos, 0);

  return (
    <DashboardLayout>
      <Header title="Médicos del Hospital" subtitle={currentDate} />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* ── Resumen rápido ── */}
          <section className="mb-6 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="rounded-xl bg-blue-100 p-3">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Médicos activos</p>
                <p className="text-2xl font-bold text-slate-800">{totalActivos}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="rounded-xl bg-emerald-100 p-3">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total citas</p>
                <p className="text-2xl font-bold text-slate-800">{totalCitas}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="rounded-xl bg-purple-100 p-3">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pacientes únicos</p>
                <p className="text-2xl font-bold text-slate-800">{totalPacientes}</p>
              </div>
            </div>
          </section>

          {/* ── Filtros ── */}
          <section className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o especialidad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              {especialidades.map((e) => (
                <option key={e} value={e}>
                  {e === "todas" ? "Todas las especialidades" : e}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">{filtered.length} médico(s)</span>
          </section>

          {/* ── Tabla ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th
                      className="cursor-pointer px-4 py-3 text-left hover:text-slate-700"
                      onClick={() => handleSort("nombre")}
                    >
                      Médico <SortIcon k="nombre" />
                    </th>
                    <th className="px-4 py-3 text-left">Especialidad</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th
                      className="cursor-pointer px-4 py-3 text-right hover:text-slate-700"
                      onClick={() => handleSort("citasCompletadas")}
                    >
                      Consultas <SortIcon k="citasCompletadas" />
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-right hover:text-slate-700"
                      onClick={() => handleSort("pacientesUnicos")}
                    >
                      Pacientes <SortIcon k="pacientesUnicos" />
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-right hover:text-slate-700"
                      onClick={() => handleSort("citasMes")}
                    >
                      Citas este mes <SortIcon k="citasMes" />
                    </th>
                    <th className="px-4 py-3 text-right">Costo consulta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No se encontraron médicos
                      </td>
                    </tr>
                  )}
                  {filtered.map((m) => (
                    <tr key={m.medicoId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {m.fotoUrl ? (
                              <img
                                src={m.fotoUrl}
                                alt={m.nombre}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{m.nombre}</p>
                            <p className="text-xs text-slate-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {m.especialidad}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            m.activo
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {m.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-800">
                            {m.stats.citasCompletadas}
                          </span>
                          <span className="text-xs text-slate-400">
                            {m.stats.totalCitas} totales
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-700">
                          {m.stats.pacientesUnicos}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-800">{m.stats.citasMes}</span>
                          <div className="mt-1 h-1.5 w-16 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-blue-400"
                              style={{
                                width: `${Math.min(
                                  (m.stats.citasMes /
                                    Math.max(
                                      ...filtered.map((x) => x.stats.citasMes),
                                      1
                                    )) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        ${m.costoConsulta.toLocaleString("es-MX")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Cards de especialidades ── */}
          {filtered.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Rendimiento por especialidad
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from(new Set(filtered.map((m) => m.especialidad))).map((esp) => {
                  const grupo = filtered.filter((m) => m.especialidad === esp);
                  const totalConsultas = grupo.reduce(
                    (s, m) => s + m.stats.citasCompletadas,
                    0
                  );
                  const totalPac = grupo.reduce((s, m) => s + m.stats.pacientesUnicos, 0);
                  return (
                    <div
                      key={esp}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div className="rounded-lg bg-purple-100 p-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">{esp}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-slate-800">{grupo.length}</p>
                          <p className="text-xs text-slate-400">médicos</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800">{totalConsultas}</p>
                          <p className="text-xs text-slate-400">consultas</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800">{totalPac}</p>
                          <p className="text-xs text-slate-400">pacientes</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
