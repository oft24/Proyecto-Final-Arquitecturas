import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Loader2, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
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

type Filtro = "todas" | "programada" | "completada" | "cancelada";

export default function RecepcionistaCitasPage() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<{ citaId: string; paciente: string } | null>(null);
  const [motivo, setMotivo] = useState("");

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const { data } = await api.get("/appointments");
      setCitas(data);
    } catch {
      toast.error("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirmCancel || !motivo.trim()) {
      toast.error("Debes ingresar un motivo de cancelación");
      return;
    }
    setDeletingId(confirmCancel.citaId);
    try {
      await api.delete(`/appointments/${confirmCancel.citaId}`, {
        data: { motivoCancelacion: motivo },
      });
      toast.success("Cita cancelada exitosamente");
      setCitas((prev) =>
        prev.map((c) =>
          c.citaId === confirmCancel.citaId ? { ...c, estado: "cancelada" } : c
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar la cita");
    } finally {
      setDeletingId(null);
      setConfirmCancel(null);
      setMotivo("");
    }
  };

  const citasFiltradas = filtro === "todas" ? citas : citas.filter((c) => c.estado === filtro);

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

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "programada", label: "Programadas" },
    { key: "completada", label: "Completadas" },
    { key: "cancelada", label: "Canceladas" },
  ];

  return (
    <DashboardLayout>
      <Header title="Gestión de Citas" subtitle={currentDate} />

      {/* Modal cancelar */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <button onClick={() => { setConfirmCancel(null); setMotivo(""); }}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">Cancelar Cita</h3>
            <p className="mb-4 text-sm text-slate-500">
              Cita de <strong>{confirmCancel.paciente}</strong>. Esta acción liberará el espacio en la agenda del médico.
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Motivo de cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Paciente no se presentó, reagendamiento..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmCancel(null); setMotivo(""); }}
                disabled={!!deletingId}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                disabled={!!deletingId || !motivo.trim()}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? "Cancelando..." : "Confirmar Cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filtro === f.key ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
              <span className="ml-1 text-xs opacity-70">
                ({f.key === "todas" ? citas.length : citas.filter((c) => c.estado === f.key).length})
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate("/recepcionista/agendar")}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Nueva Cita
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-slate-500">Cargando citas...</span>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CalendarDays className="mb-3 h-10 w-10" />
            <p className="font-medium">No hay citas {filtro !== "todas" ? filtro + "s" : ""}</p>
            <button
              onClick={() => navigate("/recepcionista/agendar")}
              className="mt-3 text-sm text-emerald-600 hover:underline"
            >
              Agendar la primera
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Paciente</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Médico</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Especialidad</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha y Hora</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Motivo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citasFiltradas.map((c) => (
                <tr key={c.citaId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.paciente}</td>
                  <td className="px-4 py-3 text-slate-600">{c.medico}</td>
                  <td className="px-4 py-3 text-slate-500">{c.especialidad}</td>
                  <td className="px-4 py-3 text-slate-500">{formatFecha(c.fecha)}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{c.motivo || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${estadoBadge(c.estado)}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.estado === "programada" && (
                      <button
                        onClick={() => setConfirmCancel({ citaId: c.citaId, paciente: c.paciente })}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Cancelar
                      </button>
                    )}
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
