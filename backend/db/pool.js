const { Pool } = require("pg");

function buildPoolConfig() {
  const sslMode = process.env.PGSSLMODE;
  const shouldUseSsl = sslMode === "require";

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl
        ? {
            rejectUnauthorized: false,
          }
        : false,
    };
  }

  return {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: shouldUseSsl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
}

const pool = new Pool(buildPoolConfig());

async function closePool() {
  await pool.end();
}

pool
  .connect()
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error("DB Error:", err.message));

module.exports = {
  pool,
  closePool,
};
