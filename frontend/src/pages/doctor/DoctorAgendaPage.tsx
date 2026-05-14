import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Loader2, Plus, User2 } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";

type EstadoCita = "Programada" | "Completada" | "Cancelada";

interface Appointment {
  citaId: string;
  date: string; // YYYY-MM-DD
  time: string;       // HH:mm
  fechaHora: string;  // ISO original
  patient: string;
  detail: string;
  status: EstadoCita;
}

interface CitaApi {
  citaId: string;
  fechaHora: string;
  estado: "programada" | "completada" | "cancelada";
  motivo: string | null;
  paciente: { nombre: string };
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const STATUS_DOT: Record<EstadoCita, string> = {
  Programada: "bg-blue-500",
  Completada: "bg-emerald-500",
  Cancelada: "bg-red-500",
};

const STATUS_BADGE: Record<EstadoCita, string> = {
  Programada: "bg-blue-100 text-blue-700",
  Completada: "bg-emerald-100 text-emerald-700",
  Cancelada: "bg-red-100 text-red-700",
};

const capitalize = (s: string): EstadoCita =>
  (s.charAt(0).toUpperCase() + s.slice(1)) as EstadoCita;

export default function DoctorAgendaPage() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get<CitaApi[]>("/doctor/citas");
        if (cancel) return;
        const mapped: Appointment[] = data.map((c) => {
          const d = new Date(c.fechaHora);
          return {
            citaId: c.citaId,
            fechaHora: c.fechaHora,
            date: toKey(d),
            time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            patient: c.paciente?.nombre ?? "Paciente",
            detail: c.motivo ?? "Sin motivo especificado",
            status: capitalize(c.estado),
          };
        });
        setAppointments(mapped);
      } catch (err: any) {
        if (!cancel) toast.error(err?.response?.data?.message || "Error al cargar tus citas");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // Agrupar citas por fecha
  const byDate = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    for (const a of appointments) {
      if (!m.has(a.date)) m.set(a.date, []);
      m.get(a.date)!.push(a);
    }
    return m;
  }, [appointments]);

  // Construir matriz del mes (semana inicia en lunes)
  const cells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // 0=Dom..6=Sab -> queremos 0=Lun..6=Dom
    const offset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return days;
  }, [viewDate]);

  const goPrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const goToday = () => {
    const t = new Date();
    setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(t);
  };

  const selectedKey = toKey(selectedDate);
  const selectedAppointments = (byDate.get(selectedKey) ?? [])
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  // Conteo por estado para la leyenda dinamica
  const monthStats = useMemo(() => {
    const ym = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;
    const inMonth = appointments.filter((a) => a.date.startsWith(ym));
    return {
      total: inMonth.length,
      programadas: inMonth.filter((a) => a.status === "Programada").length,
      completadas: inMonth.filter((a) => a.status === "Completada").length,
      canceladas: inMonth.filter((a) => a.status === "Cancelada").length,
    };
  }, [appointments, viewDate]);

  const selectedLong = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <DashboardLayout>
      <Header title="Mi Agenda" subtitle="Gestiona tus citas y horarios" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        {/* CALENDARIO */}
        <section className="card-shell overflow-hidden">
          {/* Header del calendario */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold capitalize leading-tight text-slate-900">
                  {MONTHS_ES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h2>
                <p className="text-xs text-slate-500">Vista mensual</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToday}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Hoy
              </button>
              <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={goPrev}
                  aria-label="Mes anterior"
                  className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="w-px bg-slate-200" />
                <button
                  onClick={goNext}
                  aria-label="Mes siguiente"
                  className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cabecera de días */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-white px-2 py-2">
            {WEEKDAYS_ES.map((d) => (
              <div key={d} className="px-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 p-px">
            {cells.map((day, idx) => {
              const inMonth = day.getMonth() === viewDate.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              const dayAppts = byDate.get(toKey(day)) ?? [];
              const hasAppts = dayAppts.length > 0;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={[
                    "group relative flex min-h-[78px] flex-col items-stretch gap-1 bg-white p-2 text-left transition-all duration-150 sm:min-h-[92px]",
                    inMonth ? "text-slate-800" : "text-slate-300",
                    "hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400",
                    isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition",
                        isToday
                          ? "bg-blue-600 text-white shadow-sm"
                          : isSelected
                            ? "text-blue-700"
                            : inMonth
                              ? "text-slate-700 group-hover:bg-white"
                              : "text-slate-300",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                    {hasAppts && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-blue-700">
                        {dayAppts.length}
                      </span>
                    )}
                  </div>

                  {/* Mini eventos */}
                  <div className="mt-0.5 flex flex-col gap-1">
                    {dayAppts.slice(0, 2).map((a, i) => (
                      <div
                        key={i}
                        title={`${a.time} · ${a.patient} — ${a.detail}`}
                        className="flex items-center gap-1 truncate rounded-md bg-blue-600/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-800"
                      >
                        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[a.status]}`} />
                        <span className="truncate">{a.time} {a.patient.split(" ")[0]}</span>
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <span className="text-[10px] font-medium text-slate-500">
                        +{dayAppts.length - 2} más
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Leyenda dinamica */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Programada <strong className="text-slate-700">{monthStats.programadas}</strong></span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completada <strong className="text-slate-700">{monthStats.completadas}</strong></span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Cancelada <strong className="text-slate-700">{monthStats.canceladas}</strong></span>
            <span className="ml-auto flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-200" /> Hoy</span>
          </div>
        </section>

        {/* PANEL DEL DÍA */}
        <section className="card-shell flex flex-col overflow-hidden">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-white">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">Agenda del día</p>
              <h3 className="mt-0.5 text-base font-bold capitalize leading-tight">{selectedLong}</h3>
              <p className="mt-1 text-xs text-blue-100">
                {selectedAppointments.length} {selectedAppointments.length === 1 ? "cita programada" : "citas programadas"}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 p-4">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando citas...
              </div>
            ) : selectedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Sin citas para este día</p>
                <p className="mt-1 max-w-[220px] text-xs text-slate-500">
                  Selecciona otra fecha o agenda una nueva cita para este día.
                </p>
              </div>
            ) : (
              selectedAppointments.map((a, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${STATUS_DOT[a.status]}`} />
                  <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-700">
                      <Clock className="mb-0.5 h-3 w-3" />
                      <span className="text-xs font-bold leading-none">{a.time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <User2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <p className="truncate text-sm font-semibold text-slate-900">{a.patient}</p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{a.detail}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
