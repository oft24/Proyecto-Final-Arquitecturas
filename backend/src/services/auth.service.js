import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

export async function registerUser(payload) {
  const hash = await bcrypt.hash(payload.password, 10);
  const { role, email, nombre } = payload;

  let user;

  // Registrar según el rol en el esquema correcto de Prisma
  if (role === "medico") {
    // Crear médico
    user = await prisma.medico.create({
      data: {
        email,
        passwordHash: hash,
        nombre,
        especialidad: payload.especialidad || "General",
        horario: payload.horario || {},
        costoConsulta: Number(payload.costoConsulta) || 500.00,
      },
    });
    return issueTokens(user, "medico");
  } else if (role === "recepcionista" || role === "director") {
    // Crear usuario del sistema (recepcionista o director)
    user = await prisma.usuario.create({
      data: {
        email,
        passwordHash: hash,
        nombre,
        rol: role,
      },
    });
    return issueTokens(user, role);
  } else {
    throw { status: 400, message: "Rol no válido" };
  }
}

export async function registerPatient(payload) {
  const hash = await bcrypt.hash(payload.password, 10);
  const { email, nombre, fechaNacimiento, telefono } = payload;

  // Generar folio único
  const folio = `PAC-${Date.now()}`;

  const paciente = await prisma.paciente.create({
    data: {
      email,
      passwordHash: hash,
      nombre,
      fechaNacimiento: new Date(fechaNacimiento),
      telefono,
      folio,
    },
  });

  return issueTokens(paciente, "paciente");
}

export async function loginUser(payload) {
  const { email, password, userType } = payload;

  let user = null;
  let role = null;

  // Estrategia 1: Si se especifica userType, buscar en esa tabla primero
  if (userType === "paciente") {
    user = await prisma.paciente.findUnique({ where: { email } });
    role = "paciente";
  } else if (userType === "medico") {
    user = await prisma.medico.findUnique({ where: { email } });
    role = "medico";
  } else if (userType === "usuario" || userType === "recepcionista" || userType === "director") {
    user = await prisma.usuario.findUnique({ where: { email } });
    role = user?.rol;
  }

  // Estrategia 2: Si no se encontró o no se especificó userType,
  // buscar en TODAS las tablas (fallback inteligente)
  if (!user) {
    // Buscar en médicos
    user = await prisma.medico.findUnique({ where: { email } });
    if (user) {
      role = "medico";
    } else {
      // Buscar en pacientes
      user = await prisma.paciente.findUnique({ where: { email } });
      if (user) {
        role = "paciente";
      } else {
        // Buscar en usuarios (recepcionista/director)
        user = await prisma.usuario.findUnique({ where: { email } });
        if (user) {
          role = user.rol;
        }
      }
    }
  }

  if (!user) throw { status: 401, message: "Credenciales inválidas" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw { status: 401, message: "Credenciales inválidas" };

  return issueTokens(user, role);
}

function issueTokens(user, role) {
  // Determinar el ID según el tipo de usuario
  const userId = user.usuarioId || user.medicoId || user.pacienteId;
  const nombre = user.nombre;
  const email = user.email;

  const tokenPayload = { sub: userId, role, email };
  return {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: { 
      usuarioId: userId, 
      nombre, 
      email, 
      rol: role,
      role: role  // Incluir ambos para compatibilidad
    },
  };
}
