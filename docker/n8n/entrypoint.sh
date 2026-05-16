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

# ── 2. Create the n8n database if it doesn't exist (via Node.js + pg) ──
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

# ── 3. First-run workflow import and execution ──────────────────────
SENTINEL="/home/node/.n8n/.workflow_imported"

if [ ! -f "$SENTINEL" ]; then
  echo "🚀 Starting n8n temporarily to import workflow..."

  # Start n8n in background
  n8n start &
  N8N_PID=$!

  # Wait for n8n REST API to be fully ready (not just healthz)
  echo "⏳ Waiting for n8n REST API to become fully available..."
  node -e "
  async function check() {
    try {
      const res = await fetch('http://localhost:5678/rest/settings');
      const text = await res.text();
      // Only consider ready when we get actual JSON back, not the 'starting up' message
      if (res.ok && text.startsWith('{') && !text.includes('starting up')) return;
    } catch(e) {}
    await new Promise(r => setTimeout(r, 3000));
    return check();
  }
  check().then(() => process.exit(0));
  "
  echo "✅ n8n API is ready!"

  # ── 4. Setup owner + import workflow + execute (all via Node.js) ──
  node -e "
  const fs = require('fs');
  const BASE = 'http://localhost:5678';

  async function safeJson(res) {
    const text = await res.text();
    try { return JSON.parse(text); }
    catch(e) { return { _raw: text.substring(0, 500), _status: res.status }; }
  }

  async function main() {
    // Setup owner account
    console.log('👤 Setting up n8n owner account...');
    try {
      const ownerRes = await fetch(BASE + '/rest/owner/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@cn332.local',
          firstName: 'CN332',
          lastName: 'Admin',
          password: 'Cn332Admin!'
        })
      });
      const ownerData = await safeJson(ownerRes);
      console.log('  Owner setup status:', ownerRes.status);
    } catch(e) { console.log('  Owner setup note:', e.message); }

    // Small delay for n8n to finish internal setup
    await new Promise(r => setTimeout(r, 2000));

    // Login to get cookie
    console.log('🔑 Logging into n8n...');
    const loginRes = await fetch(BASE + '/rest/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cn332.local',
        password: 'Cn332Admin!'
      })
    });
    const loginData = await safeJson(loginRes);
    console.log('  Login status:', loginRes.status);
    const cookies = loginRes.headers.getSetCookie?.() || [];
    const cookieHeader = cookies.join('; ');
    console.log('  Got cookies:', cookies.length > 0 ? 'yes' : 'no');

    // Import workflow
    console.log('📥 Importing workflow from cn332-workflow.json...');
    const wfData = JSON.parse(fs.readFileSync('/n8n-files/cn332-workflow.json', 'utf8'));
    const importPayload = {
      name: 'CN332 User Import',
      nodes: wfData.nodes || [],
      connections: wfData.connections || {},
      settings: {},
      active: false
    };

    const importRes = await fetch(BASE + '/rest/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify(importPayload)
    });
    const importData = await safeJson(importRes);
    console.log('  Import status:', importRes.status);
    const workflowId = importData?.data?.id || importData?.id;

    if (workflowId) {
      console.log('✅ Workflow imported with ID:', workflowId);

      // Execute the workflow
      console.log('▶️  Executing workflow for the first time...');
      const execRes = await fetch(BASE + '/rest/workflows/' + workflowId + '/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader
        },
        body: JSON.stringify({})
      });
      const execData = await safeJson(execRes);
      console.log('  Exec status:', execRes.status);
      console.log('✅ Workflow execution triggered!');
    } else {
      console.log('⚠️  Could not extract workflow ID.');
      console.log('  Response:', JSON.stringify(importData).substring(0, 300));
    }
  }
  main().catch(e => console.error('Error during setup:', e));
  "

  # Mark import as done
  touch "$SENTINEL"
  echo "✅ First-time setup complete!"
  echo "🎉 n8n is running at http://localhost:5678"
  wait $N8N_PID
else
  echo "ℹ️  Workflow already imported. Starting n8n normally..."
  exec n8n start
fi
