from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    USER_TYPE_CHOICES = (
        ('resident', 'ลูกบ้าน'),
        ('officer', 'นิติ'),
        ('technician', 'ช่าง'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=15)

    # --- เพิ่มฟิลด์นี้เพื่อเก็บรหัสผ่านที่คุณ Gen มาจาก n8n ---
    raw_password = models.CharField(max_length=128, blank=True, null=True, help_text="รหัสผ่านตัวจริงสำหรับแจ้งลูกบ้าน")
    
    # ข้อมูลเฉพาะของแต่ละกลุ่ม
    house_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='technician_pics/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_user_type_display()}"