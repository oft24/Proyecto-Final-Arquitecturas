import { useEffect, useState } from "react";
import { CalendarDays, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

interface Cita {
  citaId: string;
  fechaHora: string;
  medico: { nombre: string; especialidad: string };
  motivo: string;
  estado: string;
  motivoCancelacion?: string;
}

const estadoBadge: Record<string, string> = {
  programada: "bg-blue-100 text-blue-700",
  completada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-600",
};

const estadoLabel: Record<string, string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!user) return;
    api
      .get(`/patient/${user.usuarioId}/history`)
      .then(({ data }) => setCitas(data))
      .catch(() => toast.error("Error al cargar las citas"))
      .finally(() => setLoading(false));
  }, [user]);

  const citaToCancel = citas.find((c) => c.citaId === confirmId);

  const handleCancel = async () => {
    if (!confirmId) return;
    setCancelling(true);
    try {
      await api.delete(`/appointments/${confirmId}`, {
        data: { motivoCancelacion: "Cancelado por el paciente" },
      });
      toast.success("Cita cancelada");
      setCitas((prev) =>
        prev.map((c) =>
          c.citaId === confirmId ? { ...c, estado: "cancelada" } : c
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar la cita");
    } finally {
      setCancelling(false);
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Mis Citas" subtitle={currentDate} />

      {/* Modal confirmación */}
      {confirmId && citaToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">¿Cancelar esta cita?</p>
                <p className="mt-1 text-sm text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
              <button onClick={() => setConfirmId(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">{citaToCancel.medico.nombre}</p>
              <p className="text-slate-500">{citaToCancel.medico.especialidad}</p>
              <p className="text-slate-500">
                {new Date(citaToCancel.fechaHora).toLocaleDateString("es-ES", {
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
                onClick={() => setConfirmId(null)}
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

      {citas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <CalendarDays className="mb-3 h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-500">Sin citas registradas</p>
          <p className="text-sm text-slate-400">Agenda tu primera cita desde el menú</p>
        </div>
      ) : (
        <div className="space-y-3">
          {citas.map((cita) => (
            <div
              key={cita.citaId}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-sm font-bold">
                  {new Date(cita.fechaHora).toLocaleDateString("es-ES", { day: "numeric" })}
                  <br />
                  <span className="text-[10px] font-normal">
                    {new Date(cita.fechaHora).toLocaleDateString("es-ES", { month: "short" })}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{cita.medico.nombre}</p>
                  <p className="text-xs text-slate-500">{cita.medico.especialidad}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(cita.fechaHora).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {cita.motivo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoBadge[cita.estado] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {estadoLabel[cita.estado] ?? cita.estado}
                </span>
                {cita.estado === "programada" && (
                  <button
                    onClick={() => setConfirmId(cita.citaId)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
