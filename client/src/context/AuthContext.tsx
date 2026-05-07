import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type UserRole = "doctor" | "patient";
type AuthUser = { name: string; email: string; role: UserRole } | null;

type AuthContextType = {
  user: AuthUser;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);

  const value = useMemo(
    () => ({
      user,
      login: (email: string, role: UserRole) => {
        setUser({ name: role === "doctor" ? "Dra. Maria Gonzalez" : "Juan Perez", email, role });
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
