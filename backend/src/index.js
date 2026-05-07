import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ 
  message: "MediSync API", 
  version: "1.0.0",
  endpoints: {
    health: "/api/health",
    auth: "/api/auth",
    users: "/api/users",
    doctors: "/api/doctor",
    patients: "/api/patient",
    appointments: "/api/appointments"
  }
}));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "medisync-server" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`MediSync API running on http://localhost:${env.port}`);
});
