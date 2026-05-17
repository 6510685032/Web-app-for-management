Inside docker directory:
```
docker compose build (first time only)
docker compose up
```

If you want to stop the containers:
```
docker compose down
```
If you want to stop the containers and remove the volumes:
```
docker compose down -v
```
Uncase if you want to build the images again, do run this:
```
rm -rf ./docker/postgresql/database

docker compose build
...
```

Access:
```
http://localhost:8000/ (django rest)
http://localhost:5678/ (n8n)
http://localhost:5173/ (vite)
http://localhost:5432/ (postgres)
```