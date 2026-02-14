import csv
import os
import django
import random
import string

# ตั้งค่า Django ให้รู้จักโปรเจกต์ของคุณ
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile # ตรวจสอบให้แน่ใจว่าใน api/models.py มีคลาสนี้แล้ว

# ฟังก์ชันสำหรับสุ่ม Password 8 ตัวอักษร
def generate_random_password(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

def import_users_from_csv(input_csv, output_csv):
    # เปิดไฟล์เก่ามาอ่าน และเปิดไฟล์ใหม่มาเพื่อเขียนรหัสผ่านลงไป
    with open(input_csv, newline='', encoding='utf-8') as infile, \
         open(output_csv, mode='w', newline='', encoding='utf-8') as outfile:
        
        reader = csv.DictReader(infile)
        
        # เพิ่มคอลัมน์ username และ password ในไฟล์ใหม่
        fieldnames = reader.fieldnames + ['username', 'password']
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            # 1. สร้าง Username จาก email (เอาเฉพาะส่วนก่อน @)
            base_username = row['email'].split('@')[0]
            username = base_username
            
            # เช็คว่า username ซ้ำในระบบไหม ถ้าซ้ำให้เติมเลข 1, 2, 3...
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # 2. สร้าง Password แบบสุ่ม
            raw_password = generate_random_password()

            try:
                # 3. สร้าง User หลักของ Django
                user = User.objects.create_user(
                    username=username,
                    email=row['email'],
                    password=raw_password,
                    first_name=row['first_name'],
                    last_name=row['last_name']
                )

                # 4. สร้าง UserProfile เชื่อมกับ User หลัก
                UserProfile.objects.create(
                    user=user,
                    user_type=row['user_type'],
                    phone_number=row['phone_number'],
                    # ถ้าไม่มีบ้านเลขที่/ที่อยู่ ให้ใส่ค่าว่าง (None) ป้องกัน Error
                    house_number=row['house_number'] if row['house_number'] else None,
                    address=row['address'] if row['address'] else None
                )
                
                # 5. เขียนข้อมูลพร้อมรหัสผ่านลงในไฟล์ CSV อันใหม่
                row['username'] = username
                row['password'] = raw_password
                writer.writerow(row)
                
                print(f"✅ สร้างบัญชีสำเร็จ: {username} (ประเภท: {row['user_type']})")
            
            except Exception as e:
                print(f"❌ เกิดข้อผิดพลาดกับ {row['email']}: {e}")

if __name__ == "__main__":
    # ใส่ชื่อไฟล์ต้นฉบับ (users.csv) และชื่อไฟล์ที่จะให้ออกมาใหม่
    import_users_from_csv('users.csv', 'users_with_passwords.csv')
    print("-----------------------------------------------------")
    print("🎉 ดึงข้อมูลเสร็จสมบูรณ์! ไปเช็ครหัสผ่านได้ที่ไฟล์ users_with_passwords.csv")