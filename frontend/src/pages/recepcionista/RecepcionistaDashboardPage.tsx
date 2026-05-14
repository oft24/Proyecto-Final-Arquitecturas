import { useEffect, useState } from "react";
import { Clock, Users, CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

interface DashboardStats {
  totalPacientes: number;
  citasHoy: number;
  citasPendientes: number;
}

interface Paciente {
  pacienteId: string;
  nombre: string;
  email: string;
  folio: string;
  proximaCita: {
    fecha: string;
    medico: string;
    especialidad: string;
  } | null;
}

interface RecepcionistaDashboardData {
  stats: DashboardStats;
  pacientes: Paciente[];
}

export default function RecepcionistaDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<RecepcionistaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/patient/dashboard");
        setData(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error al cargar dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <DashboardLayout role="recepcionista">
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recepcionista">
      <Header 
        title={`Bienvenido, ${user?.nombre || "Recepcionista"}`} 
        subtitle={currentDate} 
      />

      {/* Estadísticas principales */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatsCard
          title="Pacientes Registrados"
          value={data?.stats.totalPacientes.toString() || "0"}
          tone="blue"
          icon={Users}
        />
        <StatsCard
          title="Citas Hoy"
          value={data?.stats.citasHoy.toString() || "0"}
          tone="green"
          icon={CalendarDays}
        />
        <StatsCard
          title="Citas Pendientes"
          value={data?.stats.citasPendientes.toString() || "0"}
          tone="yellow"
          icon={Clock}
        />
      </section>

      {/* Tabla de pacientes próximos */}
      <section className="card-shell">
        <h2 className="mb-4 text-lg font-bold">Pacientes con Próximas Citas</h2>
        
        {data?.pacientes && data.pacientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold">Folio</th>
                  <th className="px-4 py-3 text-left font-semibold">Paciente</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Próxima Cita</th>
                  <th className="px-4 py-3 text-left font-semibold">Médico</th>
                  <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.pacientes.map((paciente) => (
                  <tr key={paciente.pacienteId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{paciente.folio}</td>
                    <td className="px-4 py-3 font-semibold">{paciente.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{paciente.email}</td>
                    <td className="px-4 py-3">
                      {paciente.proximaCita ? (
                        <span className="text-slate-600">
                          {new Date(paciente.proximaCita.fecha).toLocaleDateString("es-ES", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin citas</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {paciente.proximaCita ? (
                        <div>
                          <p className="font-semibold">{paciente.proximaCita.medico}</p>
                          <p className="text-xs text-slate-600">{paciente.proximaCita.especialidad}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/recepcionista/agendar" className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                        Agendar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-slate-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>No hay pacientes registrados</span>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
