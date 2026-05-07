import { HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur md:grid-cols-2"
        >
          <div className="hidden bg-[linear-gradient(135deg,#2563eb,#0ea5e9)] p-10 text-white md:block">
            <div className="mb-6 flex items-center gap-3 text-3xl font-bold">
              <HeartPulse className="h-9 w-9" />
              MediSync
            </div>
            <p className="text-sm text-blue-100">Sistema SaaS medico premium para gestion clínica profesional.</p>
          </div>
          <div className="p-8 md:p-10">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
