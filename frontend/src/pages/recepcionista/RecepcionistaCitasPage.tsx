import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Loader2, Pencil, Plus, Search,
  SlidersHorizontal, Trash2, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { Input } from "../../components/ui/Input";
import { api } from "../../lib/api";

interface Cita {
  citaId: string;
  pacienteId: string;
  medicoId: string;
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string;
  estado: string;
  motivo: string | null;
}

interface Medico {
  medicoId: string;
  nombre: string;
  especialidad: string;
}

interface Slot {
  hora: string;
  displayTime: string;
}

type Filtro = "todas" | "programada" | "completada" | "cancelada";

export default function RecepcionistaCitasPage() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  // Filtros avanzados
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [medicoFiltro, setMedicoFiltro] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estado cancelar
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<{ citaId: string; paciente: string } | null>(null);
  const [motivo, setMotivo] = useState("");

  // Estado editar
  const [editCita, setEditCita] = useState<Cita | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [editMedicoId, setEditMedicoId] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editSlots, setEditSlots] = useState<Slot[]>([]);
  const [editSlot, setEditSlot] = useState("");
  const [editMotivo, setEditMotivo] = useState("");
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    fetchCitas();
    api.get("/appointments/doctors").then(({ data }) => setMedicos(data));
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

  // Abrir modal de edición
  const abrirEditar = (c: Cita) => {
    setEditCita(c);
    setEditMedicoId(c.medicoId);
    setEditFecha(c.fecha ? c.fecha.split("T")[0] : "");
    setEditSlot("");
    setEditSlots([]);
    setEditMotivo(c.motivo || "");
  };

  // Cargar slots cuando cambia fecha o médico en edición
  useEffect(() => {
    if (!editFecha || !editMedicoId) return;
    setCargandoSlots(true);
    setEditSlot("");
    api
      .get(`/appointments/doctors/${editMedicoId}/available?fecha=${editFecha}`)
      .then(({ data }) => setEditSlots(data))
      .catch(() => toast.error("Error al cargar horarios"))
      .finally(() => setCargandoSlots(false));
  }, [editFecha, editMedicoId]);

  const handleGuardarEdicion = async () => {
    if (!editCita) return;

    // Siempre es obligatorio seleccionar un slot (confirma fecha + hora)
    if (!editSlot) {
      toast.error("Selecciona un horario disponible");
      return;
    }

    const body: Record<string, string> = {};
    // editSlot siempre trae la fecha+hora completa del slot seleccionado
    body.fechaHora = editSlot;
    if (editMedicoId && editMedicoId !== editCita.medicoId) body.medicoId = editMedicoId;
    if (editMotivo.trim() && editMotivo !== editCita.motivo) body.motivo = editMotivo;

    setGuardando(true);
    try {
      await api.patch(`/appointments/${editCita.citaId}`, body);
      toast.success("Cita actualizada exitosamente");
      await fetchCitas();
      setEditCita(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar la cita");
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado combinado
  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      if (filtro !== "todas" && c.estado !== filtro) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincide =
          c.paciente?.toLowerCase().includes(q) ||
          c.medico?.toLowerCase().includes(q) ||
          c.especialidad?.toLowerCase().includes(q) ||
          c.motivo?.toLowerCase().includes(q);
        if (!coincide) return false;
      }

      if (medicoFiltro && c.medicoId !== medicoFiltro) return false;

      if (fechaDesde) {
        // Comparar en UTC: la fecha del input es local, la cita está en UTC
        const desde = new Date(fechaDesde + "T00:00:00.000Z");
        if (new Date(c.fecha) < desde) return false;
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta + "T23:59:59.999Z");
        if (new Date(c.fecha) > hasta) return false;
      }

      return true;
    });
  }, [citas, filtro, busqueda, medicoFiltro, fechaDesde, fechaHasta]);

  const hayFiltrosActivos = busqueda || fechaDesde || fechaHasta || medicoFiltro;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde("");
    setFechaHasta("");
    setMedicoFiltro("");
  };

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "UTC",
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

      {/* Modal editar */}
      {editCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-emerald-600 px-6 py-4 text-white">
              <div>
                <p className="font-semibold">Modificar Cita</p>
                <p className="text-xs text-emerald-200">Paciente: {editCita.paciente}</p>
              </div>
              <button onClick={() => setEditCita(null)} className="rounded-lg p-1 hover:bg-emerald-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {/* Médico */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Médico</label>
                <select
                  value={editMedicoId}
                  onChange={(e) => setEditMedicoId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  {medicos.map((m) => (
                    <option key={m.medicoId} value={m.medicoId}>
                      {m.nombre} — {m.especialidad}
                    </option>
                  ))}
                </select>
              </div>
              {/* Fecha */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={editFecha}
                  onChange={(e) => { setEditFecha(e.target.value); setEditSlot(""); }}
                />
              </div>
              {/* Slots */}
              {editFecha && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Horario <span className="text-red-500">*</span>
                  </label>
                  {cargandoSlots ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Cargando horarios...
                    </div>
                  ) : editSlots.length === 0 ? (
                    <p className="text-sm text-slate-400">No hay horarios disponibles para esta fecha</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {editSlots.map((s) => (
                        <button
                          key={s.hora}
                          type="button"
                          onClick={() => setEditSlot(s.hora)}
                          className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                            editSlot === s.hora
                              ? "border-emerald-500 bg-emerald-600 text-white"
                              : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                          }`}
                        >
                          {s.displayTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Motivo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Motivo de consulta</label>
                <textarea
                  value={editMotivo}
                  onChange={(e) => setEditMotivo(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditCita(null)}
                  disabled={guardando}
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={guardando}
                  className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Tabs de estado */}
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

        <div className="flex items-center gap-2">
          {/* Botón filtros avanzados */}
          <button
            onClick={() => setMostrarFiltros((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mostrarFiltros || hayFiltrosActivos
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hayFiltrosActivos && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {[busqueda, fechaDesde, fechaHasta, medicoFiltro].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/recepcionista/agendar")}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Nueva Cita
          </button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {mostrarFiltros && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Paciente, médico, motivo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Filtro por médico */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Médico</label>
              <select
                value={medicoFiltro}
                onChange={(e) => setMedicoFiltro(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Todos los médicos</option>
                {medicos.map((m) => (
                  <option key={m.medicoId} value={m.medicoId}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Fecha desde</label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Fecha hasta</label>
              <Input
                type="date"
                value={fechaHasta}
                min={fechaDesde}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>

          {/* Resumen y limpiar */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              Mostrando <strong>{citasFiltradas.length}</strong> de <strong>{citas.length}</strong> citas
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

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
            <p className="font-medium">
              {hayFiltrosActivos
                ? "No hay citas que coincidan con los filtros"
                : `No hay citas${filtro !== "todas" ? " " + filtro + "s" : ""}`}
            </p>
            {!hayFiltrosActivos && (
              <button
                onClick={() => navigate("/recepcionista/agendar")}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Agendar la primera
              </button>
            )}
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </button>
                        <button
                          onClick={() => setConfirmCancel({ citaId: c.citaId, paciente: c.paciente })}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> Cancelar
                        </button>
                      </div>
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
