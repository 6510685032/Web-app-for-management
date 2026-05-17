# === Stage 1: Generate users.csv from Python ===
FROM python:3.12-slim AS csv-builder

WORKDIR /build
COPY generate_real_users.py .
RUN pip install --no-cache-dir faker && \
    python generate_real_users.py

# === Stage 2: n8n with the generated CSV and workflow ===
FROM n8nio/n8n:latest

USER root

# Install pg module for database creation in entrypoint
RUN cd /tmp && npm install pg --save && mkdir -p /opt/n8n-utils && cp -r /tmp/node_modules /opt/n8n-utils/ && rm -rf /tmp/node_modules /tmp/package*.json

# Copy generated CSV into a known location
COPY --from=csv-builder /build/users.csv /home/node/.n8n-files/users.csv

# Copy the workflow JSON
COPY config/cn332-workflow.json /home/node/.n8n-files/cn332-workflow.json

# Copy and prepare the entrypoint
COPY entrypoint.sh /n8n-entrypoint.sh
RUN chmod +x /n8n-entrypoint.sh

# n8n data directory
RUN mkdir -p /home/node/.n8n /home/node/.n8n-files && chown -R node:node /home/node/.n8n /home/node/.n8n-files

USER node

ENTRYPOINT ["/n8n-entrypoint.sh"]
