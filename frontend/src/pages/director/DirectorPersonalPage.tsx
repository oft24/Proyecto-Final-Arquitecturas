import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Stethoscope, Trash2, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";

interface Medico {
  medicoId: string;
  nombre: string;
  email: string;
  especialidad: string;
  costoConsulta: number;
  activo: boolean;
  createdAt: string;
}

interface Recepcionista {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
}

type Tab = "medicos" | "recepcionistas";

export default function DirectorPersonalPage() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [recepcionistas, setRecepcionistas] = useState<Recepcionista[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("medicos");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    nombre: string;
    tipo: "medico" | "recepcionista";
  } | null>(null);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const { data } = await api.get("/users/personal");
        setMedicos(data.medicos);
        setRecepcionistas(data.recepcionistas);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error al cargar el personal");
      } finally {
        setLoading(false);
      }
    };
    fetchPersonal();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      const { data } = await api.delete(
        `/users/personal/${confirmDelete.tipo}/${confirmDelete.id}`
      );
      toast.success(data.message);
      if (confirmDelete.tipo === "medico") {
        setMedicos((prev) => prev.filter((m) => m.medicoId !== confirmDelete.id));
      } else {
        setRecepcionistas((prev) => prev.filter((r) => r.usuarioId !== confirmDelete.id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <Header title="Personal del Sistema" subtitle={currentDate} />

      {/* Modal de confirmación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">¿Eliminar personal?</h3>
            <p className="mb-5 text-sm text-slate-500">
              Estás a punto de eliminar a{" "}
              <strong>{confirmDelete.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={!!deletingId}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/director/dashboard")}
          className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/director/registrar-medico")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Médico
          </button>
          <button
            onClick={() => navigate("/director/registrar-recepcionista")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Recepcionista
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex w-fit rounded-lg border border-slate-200 bg-white p-1">
        <button
          onClick={() => setTab("medicos")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "medicos"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          Médicos ({medicos.length})
        </button>
        <button
          onClick={() => setTab("recepcionistas")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "recepcionistas"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Recepcionistas ({recepcionistas.length})
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-500">Cargando personal...</span>
        </div>
      ) : (
        <>
          {/* Tabla de médicos */}
          {tab === "medicos" && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {medicos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Stethoscope className="mb-3 h-10 w-10" />
                  <p className="font-medium">No hay médicos registrados</p>
                  <button
                    onClick={() => navigate("/director/registrar-medico")}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    Registrar el primero
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Especialidad</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Costo</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Registrado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicos.map((m) => (
                      <tr key={m.medicoId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{m.nombre}</td>
                        <td className="px-4 py-3 text-slate-500">{m.email}</td>
                        <td className="px-4 py-3 text-slate-600">{m.especialidad}</td>
                        <td className="px-4 py-3 text-slate-600">
                          ${Number(m.costoConsulta).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {m.activo ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <UserX className="h-3 w-3" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(m.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                id: m.medicoId,
                                nombre: m.nombre,
                                tipo: "medico",
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tabla de recepcionistas */}
          {tab === "recepcionistas" && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {recepcionistas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <UserCheck className="mb-3 h-10 w-10" />
                  <p className="font-medium">No hay recepcionistas registradas</p>
                  <button
                    onClick={() => navigate("/director/registrar-recepcionista")}
                    className="mt-3 text-sm text-emerald-600 hover:underline"
                  >
                    Registrar la primera
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Rol</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Registrado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recepcionistas.map((r) => (
                      <tr key={r.usuarioId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{r.nombre}</td>
                        <td className="px-4 py-3 text-slate-500">{r.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 capitalize">
                            {r.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.activo ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <UserX className="h-3 w-3" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(r.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                id: r.usuarioId,
                                nombre: r.nombre,
                                tipo: "recepcionista",
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
