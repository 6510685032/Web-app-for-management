-- Create the n8n database if it doesn't already exist.
-- This script runs automatically on first PostgreSQL init
-- (when the data directory is empty).
SELECT 'CREATE DATABASE n8n'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec
