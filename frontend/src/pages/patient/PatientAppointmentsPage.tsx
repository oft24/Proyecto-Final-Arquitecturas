import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
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

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user) return;
        const response = await api.get(`/patient/${user.usuarioId}/appointments`);
        setCitas(response.data);
      } catch (error: any) {
        console.error("Error cargando citas:", error);
        toast.error("Error al cargar las citas");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleCancelAppointment = async (citaId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    try {
      await api.delete(`/appointments/${citaId}`, {
        data: { motivoCancelacion: "Cancelado por el paciente" },
      });
      toast.success("Cita cancelada correctamente");
      setCitas(citas.filter((c) => c.citaId !== citaId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar la cita");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2">Cargando citas...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Mis Citas" subtitle="Historial completo y proximas citas medicas" />
      <section className="card-shell p-4">
        <div className="mb-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
          Gestion de Citas ({citas.length})
        </div>
        {citas.length === 0 ? (
          <p className="p-4 text-center text-slate-500">No tienes citas programadas</p>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => (
              <article
                key={cita.citaId}
                className={`rounded-xl border p-4 ${
                  cita.estado === "completada"
                    ? "border-slate-200 bg-slate-50"
                    : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{cita.medico.nombre}</p>
                    <p className="text-sm text-slate-600">{cita.medico.especialidad}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(cita.fechaHora).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">Motivo: {cita.motivo}</p>
                    <p className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {cita.estado}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button className="block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Ver Detalles
                    </button>
                    {cita.estado === "programada" && (
                      <>
                        <button className="block rounded-lg border border-slate-300 px-3 py-1 text-xs">
                          Reagendar
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(cita.citaId)}
                          className="block w-full rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-600"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
