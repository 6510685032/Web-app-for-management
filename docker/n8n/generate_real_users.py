# import csv
# import random
# from faker import Faker

# fake = Faker('th_TH')

# def generate_raw_data_csv(filename='users.csv'):
#     VILLAGE_NAME = "หมู่บ้านแสนสุข"
#     roles = [('resident', 20), ('officer', 20), ('technician', 20)]
    
#     # ใช้ set เพื่อเก็บข้อมูลที่ถูกสร้างไปแล้ว ป้องกันการซ้ำ 100%
#     used_emails = set()
#     used_names = set()
    
#     with open(filename, mode='w', newline='', encoding='utf-8') as file:
#         writer = csv.writer(file)
#         writer.writerow(['first_name', 'last_name', 'email', 'user_type', 'phone_number', 'house_number', 'address'])
        
#         for role, count in roles:
#             i = 1
#             while i <= count:
#                 f_name = fake.first_name()
#                 l_name = fake.last_name()
#                 full_name = f"{f_name} {l_name}"
                
#                 # สุ่มเลข 4 หลักเพื่อความปลอดภัยของอีเมล
#                 random_suffix = random.randint(1000, 9999)
#                 email = f"user_{random_suffix}@example.com"
                
#                 # ตรวจสอบว่าชื่อหรืออีเมลนี้เคยถูกสร้างไปหรือยัง
#                 if full_name not in used_names and email not in used_emails:
#                     phone = f"08{random.randint(10000000, 99999999)}"
                    
#                     if role == 'resident':
#                         house_no = f"99/{100 + i}"
#                         addr = f"{VILLAGE_NAME} แขวงจตุจักร กรุงเทพฯ"
#                     else:
#                         house_no = ""
#                         addr = f"สำนักงานนิติ {VILLAGE_NAME}"
                    
#                     writer.writerow([f_name, l_name, email, role, phone, house_no, addr])
                    
#                     # บันทึกค่าที่ใช้แล้วลง set
#                     used_names.add(full_name)
#                     used_emails.add(email)
#                     i += 1 # นับจำนวนเฉพาะเมื่อสร้างสำเร็จ
                
#     print(f"✅ สร้างไฟล์ {filename} เรียบร้อย (รับประกันไม่มีข้อมูลซ้ำในไฟล์)")

# if __name__ == "__main__":
#     generate_raw_data_csv()
import csv
import random
import string
from faker import Faker

fake = Faker('th_TH')

def generate_raw_data_csv(filename='users.csv'):
    VILLAGE_NAME = "หมู่บ้านแสนสุข"
    roles = [('resident', 20), ('officer', 20), ('technician', 20)]
    
    used_emails = set()
    used_names = set()
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['first_name', 'last_name', 'email', 'user_type', 'phone_number', 'house_number', 'address'])
        
        for role, count in roles:
            i = 1
            while i <= count:
                f_name = fake.first_name()
                l_name = fake.last_name()
                full_name = f"{f_name} {l_name}"
                
                # สุ่มภาษาอังกฤษ 5 ตัว + เลข 3 ตัว เพื่อให้ Username เป็นสากลและไม่ซ้ำ
                letters = ''.join(random.choices(string.ascii_lowercase, k=5))
                numbers = random.randint(100, 999)
                email = f"{letters}{numbers}@example.com"
                
                if full_name not in used_names and email not in used_emails:
                    phone = f"08{random.randint(10000000, 99999999)}"
                    
                    if role == 'resident':
                        house_no = f"99/{100 + i}"
                        addr = f"{VILLAGE_NAME} แขวงจตุจักร กรุงเทพฯ"
                    else:
                        house_no = ""
                        addr = f"สำนักงานนิติ {VILLAGE_NAME}"
                    
                    writer.writerow([f_name, l_name, email, role, phone, house_no, addr])
                    used_names.add(full_name)
                    used_emails.add(email)
                    i += 1 
                
    print(f"✅ สร้างไฟล์ {filename} สำเร็จ (ไม่มีข้อมูลซ้ำแน่นอน)")

if __name__ == "__main__":
    generate_raw_data_csv()