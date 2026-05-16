#!/bin/sh
set -e

# ── 1. Wait for PostgreSQL using Node.js TCP check ─────────────────
echo "⏳ Waiting for PostgreSQL at ${DB_POSTGRESDB_HOST}:${DB_POSTGRESDB_PORT}..."
node -e "
const net = require('net');
function check() {
  const s = new net.Socket();
  s.setTimeout(1000);
  s.on('connect', () => { s.destroy(); process.exit(0); });
  s.on('timeout', () => { s.destroy(); setTimeout(check, 1000); });
  s.on('error', () => { setTimeout(check, 1000); });
  s.connect(Number(process.env.DB_POSTGRESDB_PORT), process.env.DB_POSTGRESDB_HOST);
}
check();
"
echo "✅ PostgreSQL is ready!"

# ── 2. Create the n8n database if it doesn't exist ──────────────────
echo "🔧 Ensuring database '${DB_POSTGRESDB_DATABASE}' exists..."
node -e "
const { Client } = require('/opt/n8n-utils/node_modules/pg');
(async () => {
  const c = new Client({
    host: process.env.DB_POSTGRESDB_HOST,
    port: Number(process.env.DB_POSTGRESDB_PORT),
    user: process.env.DB_POSTGRESDB_USER,
    password: process.env.DB_POSTGRESDB_PASSWORD,
    database: 'postgres'
  });
  await c.connect();
  const res = await c.query(\"SELECT 1 FROM pg_database WHERE datname = \$1\", [process.env.DB_POSTGRESDB_DATABASE]);
  if (res.rowCount === 0) {
    await c.query('CREATE DATABASE ' + process.env.DB_POSTGRESDB_DATABASE);
    console.log('  Created database:', process.env.DB_POSTGRESDB_DATABASE);
  } else {
    console.log('  Database already exists:', process.env.DB_POSTGRESDB_DATABASE);
  }
  await c.end();
})();
"
echo "✅ Database '${DB_POSTGRESDB_DATABASE}' is ready!"

# ── 3. First-run: import workflow, setup owner, then start n8n ──────
SENTINEL="/home/node/.n8n/.workflow_imported"

if [ ! -f "$SENTINEL" ]; then
  echo "📥 First run detected — importing workflow via n8n CLI..."
  n8n import:workflow --input=/home/node/.n8n-files/cn332-workflow.json
  echo "✅ Workflow imported!"

  touch "$SENTINEL"

  # Start n8n and setup owner account
  n8n start &
  N8N_PID=$!

  echo "⏳ Waiting for n8n to be fully ready..."
  node -e "
  async function check() {
    try {
      const res = await fetch('http://localhost:5678/rest/settings');
      const text = await res.text();
      if (res.ok && text.startsWith('{') && !text.includes('starting up')) return;
    } catch(e) {}
    await new Promise(r => setTimeout(r, 3000));
    return check();
  }
  check().then(() => process.exit(0));
  "
  echo "✅ n8n is ready!"

  echo "👤 Setting up n8n owner account..."
  node -e "
  (async () => {
    const res = await fetch('http://localhost:5678/rest/owner/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cn332.local',
        firstName: 'CN332',
        lastName: 'Admin',
        password: 'Cn332Admin!'
      })
    });
    console.log('  Owner setup status:', res.status);
  })().catch(e => console.log('  Owner setup note:', e.message));
  "

  echo ""
  echo "🎉 First-time setup complete!"
  echo "   n8n UI: http://localhost:5678"
  echo "   Login:  admin@cn332.local / Cn332Admin!"
  echo "   ➡️  Please execute the workflow manually from the n8n UI."
  echo ""
  wait $N8N_PID
else
  echo "ℹ️  Workflow already imported. Starting n8n normally..."
  exec n8n start
fi
