import { prisma } from "../config/prisma.js";

/**
 * Buscar pacientes por nombre, email o folio
 */
export async function searchPacientes(query) {
  if (!query || query.trim().length === 0) {
    throw { status: 400, message: "Ingresa un término de búsqueda" };
  }

  const searchTerm = query.toLowerCase().trim();

  return prisma.paciente.findMany({
    where: {
      OR: [
        { nombre: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { folio: { contains: searchTerm, mode: "insensitive" } },
        { telefono: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    select: {
      pacienteId: true,
      nombre: true,
      email: true,
      folio: true,
      telefono: true,
      fechaNacimiento: true,
      createdAt: true,
    },
    orderBy: { nombre: "asc" },
    take: 20, // Máximo 20 resultados
  });
}

/**
 * Obtener un paciente por ID con historial completo
 */
export async function getPacienteById(pacienteId) {
  const paciente = await prisma.paciente.findUnique({
    where: { pacienteId },
    include: {
      citas: {
        include: {
          medico: {
            select: {
              nombre: true,
              especialidad: true,
              costoConsulta: true,
            },
          },
        },
        orderBy: { fechaHora: "desc" },
      },
      expedientes: {
        orderBy: { createdAt: "desc" },
        include: {
          medico: { select: { nombre: true } },
        },
      },
    },
  });

  if (!paciente) {
    throw { status: 404, message: "Paciente no encontrado" };
  }

  return paciente;
}

/**
 * Obtener lista de todos los pacientes (con paginación)
 */
export async function getAllPacientes(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [pacientes, total] = await Promise.all([
    prisma.paciente.findMany({
      select: {
        pacienteId: true,
        nombre: true,
        email: true,
        folio: true,
        telefono: true,
        fechaNacimiento: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.paciente.count(),
  ]);

  return {
    pacientes,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener citas próximas de un paciente
 */
export async function getCitasProximas(pacienteId) {
  const ahora = new Date();

  return prisma.cita.findMany({
    where: {
      pacienteId,
      fechaHora: { gte: ahora },
      estado: "programada",
    },
    include: {
      medico: {
        select: {
          nombre: true,
          especialidad: true,
          costoConsulta: true,
        },
      },
    },
    orderBy: { fechaHora: "asc" },
    take: 5,
  });
}

/**
 * Obtener expedientes de un paciente
 */
export async function getExpedientesByPaciente(pacienteId) {
  return prisma.expediente.findMany({
    where: { pacienteId },
    include: {
      medico: { select: { nombre: true, especialidad: true } },
      cita: { select: { fechaHora: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Obtener estadísticas de un paciente
 */
export async function getPacienteStats(pacienteId) {
  const [citasTotal, citasCompletadas, expedientes] = await Promise.all([
    prisma.cita.count({ where: { pacienteId } }),
    prisma.cita.count({
      where: { pacienteId, estado: "completada" },
    }),
    prisma.expediente.count({ where: { pacienteId } }),
  ]);

  return {
    citasTotal,
    citasCompletadas,
    expedientes,
    tasaCompletacion: citasTotal > 0 ? (citasCompletadas / citasTotal) * 100 : 0,
  };
}
