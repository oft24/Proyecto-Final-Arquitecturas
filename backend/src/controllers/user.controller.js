export function getMe(req, res) {
  res.json({ user: req.user });
}

export async function getPersonal(req, res) {
  try {
    const { prisma } = await import("../config/prisma.js");

    const [medicos, recepcionistas] = await Promise.all([
      prisma.medico.findMany({
        select: {
          medicoId: true,
          nombre: true,
          email: true,
          especialidad: true,
          costoConsulta: true,
          activo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.usuario.findMany({
        where: { rol: "recepcionista" },
        select: {
          usuarioId: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({ medicos, recepcionistas });
  } catch (error) {
    console.error("Error en getPersonal:", error);
    res.status(500).json({ message: "Error al obtener personal" });
  }
}
