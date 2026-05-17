## Deployment Guide
Make sure you are inside the docker directory:
```
cd docker
```

Build images and run the containers:
```
docker compose up --build (if you don't want to build the images again, just run: docker compose up)
```

To stop the containers:
```
docker compose down (if you want to remove the volumes, then do run: docker compose down -v)
```

** You will have to execute workflow to populate test users manually using n8n WebUI site (listed below), enter the default credentials given inside docker/n8n/README.md and then proceed to execute workflow there.

Default ports:
```
http://localhost:8000/ (django rest)
http://localhost:5678/ (n8n)
http://localhost:5173/ (vite)
http://localhost:5432/ (postgres)
http://localhost:9000/ (minio S3 API)
http://localhost:9001/ (minio console - login: minioadmin/minioadmin)
```
