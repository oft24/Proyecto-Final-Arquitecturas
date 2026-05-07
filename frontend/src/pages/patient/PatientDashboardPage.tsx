import { useEffect, useState } from "react";
import { Bell, CalendarClock, HeartPulse, NotebookTabs, Loader2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Cita {
  citaId: string;
  fechaHora: string;
  medico: { nombre: string; especialidad: string };
  motivo: string;
  estado: string;
}

interface PatientDashboardData {
  citasTotal: number;
  citasCompletadas: number;
  expedientes: number;
  tasaCompletacion: number;
}

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (!user) return;
        
        // Traer estadísticas del paciente
        const statsResponse = await api.get(`/patient/${user.usuarioId}/stats`);
        setData(statsResponse.data);
        
        // Traer próximas citas
        const appointmentsResponse = await api.get(`/patient/${user.usuarioId}/appointments`);
        if (appointmentsResponse.data.length > 0) {
          setProximaCita(appointmentsResponse.data[0]);
        }
      } catch (error: any) {
        console.error("Error cargando datos del paciente:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user]);

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
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2">Cargando...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={`Bienvenido, ${user?.nombre || "Paciente"}`} subtitle={currentDate} />
      {proximaCita && (
        <section className="card-shell mb-4 border-emerald-300 bg-emerald-50 p-4">
          <h3 className="mb-2 text-xl font-bold text-emerald-900">Tu Proxima Cita</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
            <div>
              <p className="text-2xl font-bold">{proximaCita.medico.nombre}</p>
              <p className="text-sm text-slate-600">{proximaCita.medico.especialidad}</p>
              <p className="text-sm text-slate-600">{new Date(proximaCita.fechaHora).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-sm text-slate-600">Motivo: {proximaCita.motivo}</p>
            </div>
            <div className="space-y-2">
              <button className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Confirmar Asistencia</button>
              <button className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-600">Cancelar Cita</button>
              <button className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">Reagendar</button>
            </div>
          </div>
        </section>
      )}
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <StatsCard title="Citas Completadas" value={data?.citasCompletadas?.toString() || "0"} tone="red" icon={HeartPulse} />
        <StatsCard title="Total de Citas" value={data?.citasTotal?.toString() || "0"} tone="blue" icon={CalendarClock} />
        <StatsCard title="Expedientes" value={data?.expedientes?.toString() || "0"} tone="green" icon={NotebookTabs} />
        <StatsCard title="Tasa Completacion" value={(data?.tasaCompletacion?.toString() || "0") + "%"} tone="purple" icon={Bell} />
      </section>
    </DashboardLayout>
  );
}
