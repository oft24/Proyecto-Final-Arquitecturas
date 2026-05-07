import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  email: z.email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormData) => {
    const role = values.email.includes("doctor") ? "doctor" : "patient";
    login(values.email, role);
    toast.success("Sesion iniciada");
    navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
  };

  return (
    <AuthLayout>
      <h1 className="mb-2 text-2xl font-bold">Iniciar sesion</h1>
      <p className="mb-6 text-sm text-slate-500">Accede a MediSync con credenciales seguras.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <Input placeholder="doctor@medisync.com" {...form.register("email")} />
          <p className="text-xs text-red-600">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm">Contrasena</label>
          <div className="relative">
            <Input type={showPass ? "text" : "password"} {...form.register("password")} />
            <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-2">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-red-600">{form.formState.errors.password?.message}</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" {...form.register("remember")} /> Recordarme</label>
          <a className="text-blue-600">Olvide mi contrasena</a>
        </div>
        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Entrar</Button>
      </form>
      <p className="mt-6 text-sm text-slate-500">
        No tienes cuenta? <Link to="/register" className="text-blue-600">Registrate</Link>
      </p>
    </AuthLayout>
  );
}
