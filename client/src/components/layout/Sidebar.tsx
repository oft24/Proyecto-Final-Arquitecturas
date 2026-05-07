import { CalendarDays, ClipboardList, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const doctorItems = [
  { to: "/doctor/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/doctor/agenda", label: "Mi Agenda", icon: CalendarDays },
  { to: "/doctor/pacientes", label: "Pacientes", icon: UserRound },
];
const patientItems = [
  { to: "/patient/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/patient/citas", label: "Mis Citas", icon: CalendarDays },
  { to: "/patient/expediente", label: "Mi Expediente", icon: ClipboardList },
  { to: "/patient/agendar", label: "Agendar Cita", icon: CalendarDays },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const items = user?.role === "doctor" ? doctorItems : patientItems;

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-2xl font-bold text-blue-600">MediSync</h2>
        <p className="mb-6 text-xs text-slate-500">{user?.role === "doctor" ? "Portal Medico" : "Portal del Paciente"}</p>
        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-100"}`
              }
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
        <LogOut className="h-4 w-4" /> Cerrar sesion
      </button>
    </aside>
  );
}
