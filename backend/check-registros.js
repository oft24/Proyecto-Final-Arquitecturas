import { prisma } from './src/config/prisma.js';

async function checkRegistros() {
  try {
    console.log('\n========================================');
    console.log('VERIFICANDO REGISTROS EN AWS RDS');
    console.log('========================================\n');

    // Contar registros en cada tabla
    const [usuarios, medicos, pacientes, citas, expedientes, notificaciones] = await Promise.all([
      prisma.usuario.count(),
      prisma.medico.count(),
      prisma.paciente.count(),
      prisma.cita.count(),
      prisma.expediente.count(),
      prisma.notificacion.count(),
    ]);

    console.log('CONTEO DE REGISTROS:');
    console.log('--------------------');
    console.log(`Usuarios:        ${usuarios}`);
    console.log(`Medicos:         ${medicos}`);
    console.log(`Pacientes:       ${pacientes}`);
    console.log(`Citas:           ${citas}`);
    console.log(`Expedientes:     ${expedientes}`);
    console.log(`Notificaciones:  ${notificaciones}`);

    console.log('\n========================================');
    console.log('DETALLE DE USUARIOS');
    console.log('========================================\n');

    const usuariosDetalle = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (usuariosDetalle.length === 0) {
      console.log('No hay usuarios registrados\n');
    } else {
      usuariosDetalle.forEach((u, i) => {
        console.log(`${i + 1}. Usuario:`);
        console.log(`   ID:         ${u.usuarioId}`);
        console.log(`   Nombre:     ${u.nombre}`);
        console.log(`   Email:      ${u.email}`);
        console.log(`   Rol:        ${u.rol}`);
        console.log(`   Activo:     ${u.activo}`);
        console.log(`   Password:   ${u.passwordHash ? 'SI (hash guardado)' : 'NO'}`);
        console.log(`   Creado:     ${u.createdAt}`);
        console.log('');
      });
    }

    console.log('========================================');
    console.log('DETALLE DE MEDICOS');
    console.log('========================================\n');

    const medicosDetalle = await prisma.medico.findMany({
      include: {
        usuario: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (medicosDetalle.length === 0) {
      console.log('No hay medicos registrados\n');
    } else {
      medicosDetalle.forEach((m, i) => {
        console.log(`${i + 1}. Medico:`);
        console.log(`   ID:           ${m.medicoId}`);
        console.log(`   Usuario ID:   ${m.usuarioId}`);
        console.log(`   Nombre:       ${m.nombre}`);
        console.log(`   Especialidad: ${m.especialidad}`);
        console.log(`   Costo:        $${m.costoConsulta}`);
        console.log(`   Activo:       ${m.activo}`);
        console.log(`   Email:        ${m.usuario.email}`);
        console.log(`   Horario:      ${JSON.stringify(m.horario)}`);
        console.log(`   Creado:       ${m.createdAt}`);
        console.log('');
      });
    }

    console.log('========================================');
    console.log('DETALLE DE PACIENTES');
    console.log('========================================\n');

    const pacientesDetalle = await prisma.paciente.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (pacientesDetalle.length === 0) {
      console.log('No hay pacientes registrados\n');
    } else {
      pacientesDetalle.forEach((p, i) => {
        console.log(`${i + 1}. Paciente:`);
        console.log(`   ID:         ${p.pacienteId}`);
        console.log(`   Nombre:     ${p.nombre}`);
        console.log(`   Email:      ${p.email}`);
        console.log(`   Folio:      ${p.folio}`);
        console.log(`   Telefono:   ${p.telefono}`);
        console.log(`   Nacimiento: ${p.fechaNacimiento}`);
        console.log(`   Creado:     ${p.createdAt}`);
        console.log('');
      });
    }

    console.log('========================================\n');

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistros();
