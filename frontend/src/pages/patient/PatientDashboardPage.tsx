import { useEffect, useState } from "react";
import { Bell, CalendarClock, HeartPulse, Loader2, NotebookTabs, X } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

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
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/patient/${user.usuarioId}/stats`),
      api.get(`/patient/${user.usuarioId}/appointments`),
    ])
      .then(([statsRes, apptRes]) => {
        setData(statsRes.data);
        if (apptRes.data.length > 0) setProximaCita(apptRes.data[0]);
      })
      .catch(() => toast.error("Error al cargar los datos"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async () => {
    if (!proximaCita) return;
    setCancelling(true);
    try {
      await api.delete(`/appointments/${proximaCita.citaId}`, {
        data: { motivoCancelacion: "Cancelado por el paciente" },
      });
      toast.success("Cita cancelada");
      setProximaCita(null);
      // Actualizar stats
      if (data) setData({ ...data, citasTotal: data.citasTotal });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar la cita");
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={`Bienvenido, ${user?.nombre || "Paciente"}`} subtitle={currentDate} />

      {/* Modal confirmación cancelar */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">¿Cancelar esta cita?</p>
                <p className="mt-1 text-sm text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
              <button onClick={() => setShowConfirm(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">{proximaCita?.medico.nombre}</p>
              <p className="text-slate-500">{proximaCita?.medico.especialidad}</p>
              <p className="text-slate-500">
                {proximaCita &&
                  new Date(proximaCita.fechaHora).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Próxima cita */}
      {proximaCita && (
        <section className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Tu próxima cita
          </h3>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-slate-800">{proximaCita.medico.nombre}</p>
              <p className="text-sm text-slate-600">{proximaCita.medico.especialidad}</p>
              <p className="mt-1 text-sm text-slate-600">
                {new Date(proximaCita.fechaHora).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {proximaCita.motivo && (
                <p className="mt-1 text-sm text-slate-500">Motivo: {proximaCita.motivo}</p>
              )}
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Cancelar cita
            </button>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          title="Citas completadas"
          value={data?.citasCompletadas?.toString() || "0"}
          tone="green"
          icon={HeartPulse}
        />
        <StatsCard
          title="Total de citas"
          value={data?.citasTotal?.toString() || "0"}
          tone="blue"
          icon={CalendarClock}
        />
        <StatsCard
          title="Expedientes"
          value={data?.expedientes?.toString() || "0"}
          tone="purple"
          icon={NotebookTabs}
        />
        <StatsCard
          title="Tasa de completación"
          value={`${Math.round(data?.tasaCompletacion ?? 0)}%`}
          tone="yellow"
          icon={Bell}
        />
      </section>
    </DashboardLayout>
  );
}
