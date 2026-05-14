import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";

export type UserRole = "recepcionista" | "medico" | "director" | "paciente";

export type AuthUser = {
  usuarioId: string;
  email: string;
  nombre: string;
  rol: UserRole;
} | null;

export type { RegisterData, RegisterPatientData };

type AuthContextType = {
  user: AuthUser;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  registerPatient: (data: RegisterPatientData) => Promise<void>;
  logout: () => void;
};

type RegisterData = {
  nombre: string;
  email: string;
  password: string;
  role: "recepcionista" | "medico" | "director";
  especialidad?: string;
  costoConsulta?: number;
};

type RegisterPatientData = {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  telefono: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (registerData: RegisterData) => {
    try {
      const { data } = await api.post("/auth/register", registerData);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const registerPatient = async (patientData: RegisterPatientData) => {
    try {
      const { data } = await api.post("/auth/register/patient", patientData);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  function getErrorMessage(error: any): string {
    // Errores de validación
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const validationErrors = error.response.data.errors;
      return validationErrors
        .map((err: any) => {
          const field = err.path || err.param || "campo";
          const msg = err.msg || "error de validación";
          return `${field}: ${msg}`;
        })
        .join(", ");
    }
    
    // Mensaje directo del servidor
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Error de red
    if (!error.response) {
      return "Error de conexión. Verifica que el servidor esté ejecutándose.";
    }
    
    // Error genérico
    return "Error al procesar la solicitud. Intenta nuevamente.";
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      registerPatient,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
