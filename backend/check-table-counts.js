import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'MediSync2026!Secure',
  database: 'medisync',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTableCounts() {
  try {
    await client.connect();
    console.log('✅ Conectado a RDS - Base de datos: medisync\n');

    console.log('========================================');
    console.log('TABLAS Y CONTEO DE REGISTROS');
    console.log('========================================\n');

    const tables = ['usuarios', 'medicos', 'pacientes', 'citas', 'expedientes', 'notificaciones'];

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as total FROM ${table};`);
      const count = result.rows[0].total;
      console.log(`📊 ${table.toUpperCase().padEnd(20)} → ${count} registros`);
    }

    console.log('\n========================================');
    console.log('DETALLE DE MÉDICOS');
    console.log('========================================\n');

    const medicos = await client.query(`
      SELECT 
        medico_id,
        nombre,
        email,
        especialidad,
        costo_consulta,
        activo,
        created_at
      FROM medicos
      ORDER BY created_at DESC;
    `);

    if (medicos.rows.length > 0) {
      medicos.rows.forEach((medico, index) => {
        console.log(`${index + 1}. ${medico.nombre}`);
        console.log(`   📧 Email:        ${medico.email}`);
        console.log(`   🏥 Especialidad: ${medico.especialidad}`);
        console.log(`   💰 Costo:        $${medico.costo_consulta}`);
        console.log(`   ✅ Activo:       ${medico.activo}`);
        console.log(`   📅 Creado:       ${medico.created_at}`);
        console.log('');
      });
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableCounts();
