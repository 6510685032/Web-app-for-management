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
Incase if you want to build the images again, do run this:
```
rm -rf ./docker/postgresql/database

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