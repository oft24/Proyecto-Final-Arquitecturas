import { useEffect, useState } from "react";
import {
  Activity,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Loader2,
  Stethoscope,
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

interface HospitalStats {
  resumen: {
    totalMedicos: number;
    medicosActivos: number;
    totalPacientes: number;
    totalRecepcionistas: number;
    citasHoy: number;
    citasMes: number;
    citasPendientes: number;
    citasCompletadas: number;
    citasCanceladas: number;
    expedientesMes: number;
    ingresosTotalMes: number;
    variacionCitas: number;
  };
  graficas: {
    citasPorDia: { fecha: string; citas: number }[];
    pacientesPorMes: { mes: string; pacientes: number }[];
    especialidades: { especialidad: string; cantidad: number }[];
  };
  topMedicos: {
    medicoId: string;
    nombre: string;
    especialidad: string;
    costoConsulta: number;
    citasCompletadas: number;
  }[];
}

export default function DirectorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    api
      .get("/director/stats")
      .then(({ data }) => setStats(data))
      .catch(() => toast.error("No se pudieron cargar las estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  // Altura máxima de barras en la gráfica
  const maxCitas = stats
    ? Math.max(...stats.graficas.citasPorDia.map((d) => d.citas), 1)
    : 1;
  const maxPacientes = stats
    ? Math.max(...stats.graficas.pacientesPorMes.map((d) => d.pacientes), 1)
    : 1;

  return (
    <DashboardLayout>
      <Header title={`Bienvenido, ${user?.nombre ?? "Director"}`} subtitle={currentDate} />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* ── KPIs principales ── */}
          <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Médicos activos"
              value={String(stats?.resumen.medicosActivos ?? 0)}
              subtitle={`${stats?.resumen.totalMedicos ?? 0} en total`}
              tone="blue"
              icon={Stethoscope}
            />
            <StatsCard
              title="Pacientes registrados"
              value={String(stats?.resumen.totalPacientes ?? 0)}
              subtitle="Total acumulado"
              tone="green"
              icon={UserRound}
            />
            <StatsCard
              title="Citas hoy"
              value={String(stats?.resumen.citasHoy ?? 0)}
              subtitle={`${stats?.resumen.citasPendientes ?? 0} pendientes`}
              tone="yellow"
              icon={CalendarDays}
            />
            <StatsCard
              title="Citas este mes"
              value={String(stats?.resumen.citasMes ?? 0)}
              subtitle={
                stats?.resumen.variacionCitas !== undefined
                  ? `${stats.resumen.variacionCitas >= 0 ? "+" : ""}${stats.resumen.variacionCitas}% vs mes anterior`
                  : ""
              }
              tone="purple"
              icon={TrendingUp}
            />
          </section>

          {/* ── Segunda fila de KPIs ── */}
          <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Consultas completadas"
              value={String(stats?.resumen.citasCompletadas ?? 0)}
              subtitle="Total histórico"
              tone="green"
              icon={CalendarCheck}
            />
            <StatsCard
              title="Tasa de cancelación"
              value={(() => {
                const total = (stats?.resumen.citasCompletadas ?? 0) + (stats?.resumen.citasCanceladas ?? 0);
                if (total === 0) return "0%";
                return `${Math.round(((stats?.resumen.citasCanceladas ?? 0) / total) * 100)}%`;
              })()}
              subtitle={`${stats?.resumen.citasCanceladas ?? 0} canceladas de ${(stats?.resumen.citasCompletadas ?? 0) + (stats?.resumen.citasCanceladas ?? 0)} cerradas`}
              tone="red"
              icon={Activity}
            />
            <StatsCard
              title="Expedientes este mes"
              value={String(stats?.resumen.expedientesMes ?? 0)}
              subtitle="Nuevos registros"
              tone="blue"
              icon={UserCheck}
            />
            <StatsCard
              title="Recepcionistas"
              value={String(stats?.resumen.totalRecepcionistas ?? 0)}
              subtitle="Personal activo"
              tone="yellow"
              icon={Users}
            />
          </section>

          {/* ── Gráficas ── */}
          <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Citas últimos 7 días */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-700">
                Citas — últimos 7 días
              </h3>
              <p className="mb-4 text-xs text-slate-400">
                Total: {stats?.graficas.citasPorDia.reduce((s, d) => s + d.citas, 0) ?? 0} citas
              </p>
              <div className="flex h-40 items-end gap-2">
                {stats?.graficas.citasPorDia.map((d) => {
                  // Escala: barra más alta = 90% del contenedor, 0 = 0px
                  const pct = maxCitas > 0 ? (d.citas / maxCitas) * 90 : 0;
                  return (
                    <div key={d.fecha} className="group flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-bold text-blue-600">{d.citas}</span>
                      <div className="relative w-full">
                        <div
                          className="w-full rounded-t-lg bg-blue-500 transition-all duration-500 group-hover:bg-blue-600"
                          style={{ height: pct > 0 ? `${pct * 1.44}px` : "3px", opacity: pct > 0 ? 1 : 0.25 }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 text-center leading-tight">{d.fecha}</span>
                    </div>
                  );
                })}
              </div>
              {/* Línea base */}
              <div className="mt-1 h-px w-full bg-slate-200" />
            </div>

            {/* Nuevos pacientes por mes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-700">
                Nuevos pacientes — últimos 6 meses
              </h3>
              <p className="mb-4 text-xs text-slate-400">
                Total: {stats?.graficas.pacientesPorMes.reduce((s, d) => s + d.pacientes, 0) ?? 0} pacientes
              </p>
              <div className="flex h-40 items-end gap-2">
                {stats?.graficas.pacientesPorMes.map((d) => {
                  const pct = maxPacientes > 0 ? (d.pacientes / maxPacientes) * 90 : 0;
                  return (
                    <div key={d.mes} className="group flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-bold text-emerald-600">{d.pacientes}</span>
                      <div
                        className="w-full rounded-t-lg bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-600"
                        style={{ height: pct > 0 ? `${pct * 1.44}px` : "3px", opacity: pct > 0 ? 1 : 0.25 }}
                      />
                      <span className="text-[10px] text-slate-400">{d.mes}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 h-px w-full bg-slate-200" />
            </div>
          </section>

          {/* ── Top médicos + Especialidades ── */}
          <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Top médicos */}
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Top médicos por consultas</h3>
                <button
                  onClick={() => navigate("/director/medicos")}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  Ver todos <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-3">
                {stats?.topMedicos.length === 0 && (
                  <p className="text-sm text-slate-400">Sin datos aún</p>
                )}
                {stats?.topMedicos.map((m, i) => (
                  <div key={m.medicoId} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{m.nombre}</p>
                      <p className="text-xs text-slate-500">{m.especialidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{m.citasCompletadas}</p>
                      <p className="text-xs text-slate-400">consultas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución por especialidad */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Por especialidad</h3>
              <div className="space-y-3">
                {stats?.graficas.especialidades.length === 0 && (
                  <p className="text-sm text-slate-400">Sin datos aún</p>
                )}
                {stats?.graficas.especialidades.map((e) => {
                  const total = stats.resumen.medicosActivos || 1;
                  const pct = Math.round((e.cantidad / total) * 100);
                  return (
                    <div key={e.especialidad}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[120px]">
                          {e.especialidad}
                        </span>
                        <span className="text-slate-500">
                          {e.cantidad} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Accesos rápidos ── */}
          <section>
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Acciones rápidas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => navigate("/director/registrar-medico")}
                className="flex flex-col items-start gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="rounded-xl bg-blue-100 p-3">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Registrar Médico</p>
                  <p className="text-xs text-slate-500">Agregar nuevo médico</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/director/registrar-recepcionista")}
                className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="rounded-xl bg-emerald-100 p-3">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Registrar Recepcionista</p>
                  <p className="text-xs text-slate-500">Agregar recepcionista</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/director/medicos")}
                className="flex flex-col items-start gap-3 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:border-purple-400 hover:shadow-md"
              >
                <div className="rounded-xl bg-purple-100 p-3">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Ver Médicos</p>
                  <p className="text-xs text-slate-500">Estadísticas por médico</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/director/personal")}
                className="flex flex-col items-start gap-3 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md"
              >
                <div className="rounded-xl bg-amber-100 p-3">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Ver Personal</p>
                  <p className="text-xs text-slate-500">Médicos y recepcionistas</p>
                </div>
              </button>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
