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

Incase if you want to build the images again, do run this:
```
rm -rf ./postgresql/database

(then proceeds to run the docker build again as normal)
docker compose build
...
```

Default ports:
```
http://localhost:8000/ (django rest)
http://localhost:5678/ (n8n)
http://localhost:5173/ (vite)
http://localhost:5432/ (postgres)
```