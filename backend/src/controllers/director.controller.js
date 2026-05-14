import { prisma } from "../config/prisma.js";

/**
 * GET /api/director/stats
 * Estadísticas generales del hospital para el director
 */
export async function getHospitalStats(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Inicio del mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    // Inicio del mes anterior
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

    const [
      totalMedicos,
      medicosActivos,
      totalPacientes,
      totalRecepcionistas,
      citasHoy,
      citasMes,
      citasMesAnterior,
      citasPendientes,
      citasCompletadas,
      citasCanceladas,
      expedientesMes,
      ingresosMes,
    ] = await Promise.all([
      prisma.medico.count(),
      prisma.medico.count({ where: { activo: true } }),
      prisma.paciente.count(),
      prisma.usuario.count({ where: { rol: "recepcionista", activo: true } }),
      prisma.cita.count({
        where: { fechaHora: { gte: hoy, lt: manana } },
      }),
      prisma.cita.count({
        where: { fechaHora: { gte: inicioMes } },
      }),
      prisma.cita.count({
        where: {
          fechaHora: { gte: inicioMesAnterior, lt: inicioMes },
        },
      }),
      prisma.cita.count({ where: { estado: "programada", fechaHora: { gte: new Date() } } }),
      prisma.cita.count({ where: { estado: "completada" } }),
      prisma.cita.count({ where: { estado: "cancelada" } }),
      prisma.expediente.count({ where: { createdAt: { gte: inicioMes } } }),
      prisma.cita.aggregate({
        _sum: { duracionMin: true },
        where: { estado: "completada", fechaHora: { gte: inicioMes } },
      }),
    ]);

    // Ingresos estimados del mes (citas completadas × costo promedio)
    const ingresosData = await prisma.cita.findMany({
      where: { estado: "completada", fechaHora: { gte: inicioMes } },
      include: { medico: { select: { costoConsulta: true } } },
    });
    const ingresosTotalMes = ingresosData.reduce(
      (sum, c) => sum + Number(c.medico.costoConsulta),
      0
    );

    // Citas por día (últimos 7 días)
    const citasPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(hoy);
      dia.setDate(dia.getDate() - i);
      const diaSig = new Date(dia);
      diaSig.setDate(diaSig.getDate() + 1);
      const count = await prisma.cita.count({
        where: { fechaHora: { gte: dia, lt: diaSig } },
      });
      citasPorDia.push({
        fecha: dia.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        citas: count,
      });
    }

    // Top 5 médicos por citas completadas (todo el tiempo)
    const topMedicos = await prisma.medico.findMany({
      where: { activo: true },
      select: {
        medicoId: true,
        nombre: true,
        especialidad: true,
        costoConsulta: true,
        _count: {
          select: {
            citas: { where: { estado: "completada" } },
          },
        },
      },
      orderBy: {
        citas: { _count: "desc" },
      },
      take: 5,
    });

    // Distribución por especialidad
    const especialidades = await prisma.medico.groupBy({
      by: ["especialidad"],
      where: { activo: true },
      _count: { medicoId: true },
      orderBy: { _count: { medicoId: "desc" } },
    });

    // Crecimiento de pacientes (últimos 6 meses)
    const pacientesPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const mesInicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 1);
      const count = await prisma.paciente.count({
        where: { createdAt: { gte: mesInicio, lt: mesFin } },
      });
      pacientesPorMes.push({
        mes: mesInicio.toLocaleDateString("es-ES", { month: "short" }),
        pacientes: count,
      });
    }

    const variacionCitas =
      citasMesAnterior > 0
        ? Math.round(((citasMes - citasMesAnterior) / citasMesAnterior) * 100)
        : 0;

    res.json({
      resumen: {
        totalMedicos,
        medicosActivos,
        totalPacientes,
        totalRecepcionistas,
        citasHoy,
        citasMes,
        citasPendientes,
        citasCompletadas,
        citasCanceladas,
        expedientesMes,
        ingresosTotalMes,
        variacionCitas,
      },
      graficas: {
        citasPorDia,
        pacientesPorMes,
        especialidades: especialidades.map((e) => ({
          especialidad: e.especialidad,
          cantidad: e._count.medicoId,
        })),
      },
      topMedicos: topMedicos.map((m) => ({
        medicoId: m.medicoId,
        nombre: m.nombre,
        especialidad: m.especialidad,
        costoConsulta: Number(m.costoConsulta),
        citasCompletadas: m._count.citas,
      })),
    });
  } catch (error) {
    console.error("Error en getHospitalStats:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}

/**
 * GET /api/director/medicos
 * Lista de médicos con sus estadísticas individuales
 */
export async function getMedicosConStats(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const medicos = await prisma.medico.findMany({
      select: {
        medicoId: true,
        nombre: true,
        email: true,
        especialidad: true,
        costoConsulta: true,
        horario: true,
        fotoUrl: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            citas: true,
            expedientes: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    // Para cada médico, obtener stats adicionales
    const medicosConStats = await Promise.all(
      medicos.map(async (m) => {
        const [citasCompletadas, citasMes, pacientesUnicos] = await Promise.all([
          prisma.cita.count({
            where: { medicoId: m.medicoId, estado: "completada" },
          }),
          prisma.cita.count({
            where: { medicoId: m.medicoId, fechaHora: { gte: inicioMes } },
          }),
          prisma.cita.findMany({
            where: { medicoId: m.medicoId },
            select: { pacienteId: true },
            distinct: ["pacienteId"],
          }),
        ]);

        return {
          medicoId: m.medicoId,
          nombre: m.nombre,
          email: m.email,
          especialidad: m.especialidad,
          costoConsulta: Number(m.costoConsulta),
          horario: m.horario,
          fotoUrl: m.fotoUrl,
          activo: m.activo,
          createdAt: m.createdAt,
          stats: {
            totalCitas: m._count.citas,
            citasCompletadas,
            citasMes,
            pacientesUnicos: pacientesUnicos.length,
            expedientes: m._count.expedientes,
          },
        };
      })
    );

    res.json({ medicos: medicosConStats });
  } catch (error) {
    console.error("Error en getMedicosConStats:", error);
    res.status(500).json({ message: "Error al obtener médicos" });
  }
}
