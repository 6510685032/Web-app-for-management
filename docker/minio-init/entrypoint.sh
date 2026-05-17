#!/bin/sh
set -e

echo "⏳ Waiting for MinIO to be ready..."
until mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" 2>/dev/null; do
  sleep 2
done
echo "✅ MinIO is ready!"

# Skip if bucket already exists
if mc ls "local/${MINIO_BUCKET_NAME}" >/dev/null 2>&1; then
  echo "ℹ️  Bucket '${MINIO_BUCKET_NAME}' already exists. Skipping."
  exit 0
fi

echo "🪣 Creating bucket '${MINIO_BUCKET_NAME}'..."
mc mb "local/${MINIO_BUCKET_NAME}"

echo "🔓 Setting public read access..."
mc anonymous set download "local/${MINIO_BUCKET_NAME}"

echo "✅ Bucket '${MINIO_BUCKET_NAME}' is ready!"
