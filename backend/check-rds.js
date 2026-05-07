import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'admin123!',
  database: 'postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado al servidor RDS');

    const res = await client.query("SELECT datname FROM pg_database WHERE datname='medisync'");
    if (res.rows.length > 0) {
      console.log('✅ Base de datos "medisync" YA EXISTE');
    } else {
      console.log('⚠️  Base de datos "medisync" NO EXISTE - creando...');
      await client.query('CREATE DATABASE medisync');
      console.log('✅ Base de datos "medisync" CREADA exitosamente');
    }

    const dbs = await client.query('SELECT datname FROM pg_database ORDER BY datname');
    console.log('\n📋 Bases de datos disponibles:');
    dbs.rows.forEach(r => console.log('  -', r.datname));

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
