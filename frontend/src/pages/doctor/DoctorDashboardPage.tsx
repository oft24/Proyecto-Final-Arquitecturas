import { useEffect, useState } from "react";
import { AlertCircle, Clock3, Users, Loader2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { AppointmentCard } from "../../components/cards/AppointmentCard";
import { AlertCard } from "../../components/cards/AlertCard";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface DashboardData {
  medico: {
    nombre: string;
    especialidad: string;
    costoConsulta: number;
  };
  stats: {
    patientsToday: number;
    pendingAppointments: number;
    cancelled: number;
  };
  proximasCitas: Array<{
    citaId: string;
    paciente: string;
    fechaHora: string;
    motivo: string | null;
  }>;
  alerts: Array<{
    title: string;
    description: string;
  }>;
}

export default function DoctorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/doctor/dashboard");
        setData(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error al cargar dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <p className="text-red-600">Error al cargar el dashboard. Intente nuevamente.</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <DashboardLayout>
      <Header 
        title={`Bienvenida, ${data.medico.nombre}`} 
        subtitle={currentDate} 
      />
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <StatsCard 
          title="Pacientes Hoy" 
          value={data.stats.patientsToday.toString()} 
          subtitle="Pacientes atendidos" 
          tone="blue" 
          icon={Users} 
        />
        <StatsCard 
          title="Citas Pendientes" 
          value={data.stats.pendingAppointments.toString()} 
          subtitle="Requieren confirmacion" 
          tone="yellow" 
          icon={Clock3} 
        />
        <StatsCard 
          title="Canceladas" 
          value={data.stats.cancelled.toString()} 
          subtitle="Total canceladas" 
          tone="red" 
          icon={AlertCircle} 
        />
      </section>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="card-shell p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-blue-600 p-3 text-white">
            <h3 className="font-semibold">Próximas Citas</h3>
          </div>
          {data.proximasCitas.length === 0 ? (
            <p className="p-4 text-center text-slate-500">No hay citas programadas</p>
          ) : (
            data.proximasCitas.map((cita) => (
              <AppointmentCard 
                key={cita.citaId}
                time={formatDate(cita.fechaHora)} 
                patient={cita.paciente} 
                detail={cita.motivo || "Sin motivo especificado"} 
                status="Programada" 
              />
            ))
          )}
        </div>
        <div className="space-y-4">
          {data.alerts.length > 0 && (
            <div className="card-shell bg-amber-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-amber-900">Alertas</h3>
              <div className="space-y-2">
                {data.alerts.map((alert, index) => (
                  <AlertCard key={index} title={alert.title} description={alert.description} />
                ))}
              </div>
            </div>
          )}
          <div className="card-shell bg-purple-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-purple-900">Información del Médico</h3>
            <p className="text-sm text-slate-700">Especialidad: <strong>{data.medico.especialidad}</strong></p>
            <p className="text-sm text-slate-700">Costo consulta: <strong>${data.medico.costoConsulta}</strong></p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
