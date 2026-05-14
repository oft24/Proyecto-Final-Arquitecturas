import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, Loader2, Plus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

interface Cita {
  citaId: string;
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string;
  estado: string;
  motivo: string | null;
}

interface DashboardStats {
  totalPacientes: number;
  citasHoy: number;
  citasPendientes: number;
}

export default function RecepcionistaDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ totalPacientes: 0, citasHoy: 0, citasPendientes: 0 });
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, citasRes] = await Promise.all([
          api.get("/patient/dashboard"),
          api.get("/appointments"),
        ]);
        setStats(dashRes.data.stats);
        setCitas(citasRes.data.slice(0, 10));
      } catch (error: any) {
        toast.error("Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      programada: "bg-blue-100 text-blue-700",
      completada: "bg-emerald-100 text-emerald-700",
      cancelada: "bg-red-100 text-red-700",
    };
    return map[estado] ?? "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-slate-500">Cargando...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={`Bienvenida, ${user?.nombre ?? "Recepcionista"}`} subtitle={currentDate} />

      {/* Stats */}
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatsCard title="Total Pacientes" value={stats.totalPacientes.toString()} subtitle="Registrados en el sistema" tone="blue" icon={Users} />
        <StatsCard title="Citas Hoy" value={stats.citasHoy.toString()} subtitle="Programadas para hoy" tone="yellow" icon={CalendarDays} />
        <StatsCard title="Pendientes" value={stats.citasPendientes.toString()} subtitle="Por atender" tone="red" icon={Clock3} />
      </section>

      {/* Acciones rápidas + tabla de citas */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_3fr]">

        {/* Acciones */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Acciones Rápidas</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/recepcionista/agendar")}
              className="flex w-full items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Agendar Cita
            </button>
            <button
              onClick={() => navigate("/recepcionista/citas")}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays className="h-4 w-4" /> Ver Todas las Citas
            </button>
            <button
              onClick={() => navigate("/recepcionista/pacientes")}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Users className="h-4 w-4" /> Ver Pacientes
            </button>
          </div>
        </div>

        {/* Citas recientes */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-600 px-5 py-3">
            <h3 className="font-semibold text-white">Citas Recientes</h3>
            <button
              onClick={() => navigate("/recepcionista/agendar")}
              className="rounded bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-100"
            >
              + Nueva Cita
            </button>
          </div>
          {citas.length === 0 ? (
            <p className="p-8 text-center text-slate-400">No hay citas registradas</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Médico</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.map((c) => (
                  <tr key={c.citaId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.paciente}</td>
                    <td className="px-4 py-3 text-slate-600">{c.medico}</td>
                    <td className="px-4 py-3 text-slate-500">{formatFecha(c.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${estadoBadge(c.estado)}`}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
