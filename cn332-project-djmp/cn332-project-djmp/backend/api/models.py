from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    USER_TYPE_CHOICES = (
        ('resident', 'ลูกบ้าน'),
        ('officer', 'นิติ'),
        ('technician', 'ช่าง'),
        ('admin', 'ผู้ดูแลระบบ'),
    )

    SPECIALTY_CHOICES = (
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('Air Conditioning', 'Air Conditioning'),
        ('Structural', 'Structural'),
        ('General', 'General'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default="resident"
    )

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    house_number = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    address = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        blank=True,
        null=True
    )

    specialty = models.CharField(
        max_length=50,
        choices=SPECIALTY_CHOICES,
        blank=True,
        null=True,
        help_text="ความถนัดของช่าง (เฉพาะ technician)"
    )

    raw_password = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        help_text="รหัสผ่านตัวจริงจาก n8n (ใช้สำหรับแจ้งผู้ใช้)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_user_type_display()}"


class MaintenanceRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    CATEGORY_CHOICES = (
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('Air Conditioning', 'Air Conditioning'),
        ('Structural', 'Structural'),
        ('Common Area', 'Common Area'),
        ('Elevator', 'Elevator'),
        ('Security', 'Security'),
        ('Parking', 'Parking'),
        ('Other', 'Other'),
    )

    APPROVAL_CHOICES = (
        ('', 'N/A'),
        ('pending_approval', 'รอการอนุมัติ'),
        ('approved', 'อนุมัติเสร็จงานแล้ว'),
        ('rejected', 'ไม่อนุมัติเสร็จงาน'),
    )

    resident = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='maintenance_requests'
    )

    assigned_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )

    request_code = models.CharField(
        max_length=30,
        unique=True,
        blank=True
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    location = models.CharField(
        max_length=100
    )

    description = models.TextField()

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    technician_notes = models.TextField(
        blank=True,
        null=True
    )

    materials_used = models.TextField(
        blank=True,
        null=True,
        help_text="วัสดุที่ใช้ในการซ่อม"
    )

    deadline = models.DateTimeField(
        blank=True,
        null=True,
        help_text="กำหนดส่งงาน"
    )

    approved_completion = models.CharField(
        max_length=20,
        choices=APPROVAL_CHOICES,
        default='',
        blank=True,
        help_text="สถานะการอนุมัติงานที่เสร็จ"
    )

    specialty_required = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="ความถนัดที่ต้องการสำหรับงานนี้"
    )

    scheduled_date = models.DateField(
        blank=True,
        null=True
    )

    scheduled_time = models.TimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.request_code:
            year = timezone.now().year
            next_id = MaintenanceRequest.objects.count() + 1
            self.request_code = f"REQ-{year}-{next_id:03d}"
        # Auto-set specialty_required from category
        if not self.specialty_required and self.category:
            category_to_specialty = {
                'Plumbing': 'Plumbing',
                'Electrical': 'Electrical',
                'Air Conditioning': 'Air Conditioning',
                'Structural': 'Structural',
            }
            self.specialty_required = category_to_specialty.get(self.category, 'General')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.request_code or f"Request #{self.pk}"


class MaintenanceRequestImage(models.Model):
    maintenance_request = models.ForeignKey(
        MaintenanceRequest,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(
        upload_to='maintenance_requests/'
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.maintenance_request.request_code}"


class Announcement(models.Model):
    TYPE_CHOICES = (
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('success', 'Success'),
        ('announcement', 'Announcement'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title