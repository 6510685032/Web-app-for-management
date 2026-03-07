//ต้องdowload node.jsก่อนต้องเพิ่มเข้าenvด้วยนะpathไม่งันมันไม่ทำงาน

backend

cd backend
pip install -r requirements.txt  
python manage.py makemigrations api
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

django rest framework
http://127.0.0.1:8000/api/users/

frontend

cd fronted
npm install   
npm run dev

database
-n8n
-postgreSQL

https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
-version 16.13

npm install -g n8n

n8n

ถ้าขึ้น 
Editor is now accessible via:
http://localhost:5678

เเล้วมันจะให้กด o
ใช้งานได้เลย

ไฟล์อยู่ใน database ชื่อ my workflow importใส่ในn8n
ต้องเอาไฟล์ csv ไปใส่ที่ C:\Users\[ชื่อคอมเรา]\.n8n-files\users.csv
users.csvอยู่ใน backend