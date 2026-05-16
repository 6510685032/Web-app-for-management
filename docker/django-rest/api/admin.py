# # from django.contrib import admin
# # from .models import UserProfile
# # admin.site.register(UserProfile)

# from django.contrib import admin
# from .models import UserProfile

# @admin.register(UserProfile)
# class UserProfileAdmin(admin.ModelAdmin):
#     # 1. กำหนดหัวตารางให้แสดงข้อมูลที่จำเป็นครบถ้วน
#     list_display = (
#         'get_username',     # แสดงชื่อผู้ใช้
#         'get_full_name',    # แสดงชื่อ-นามสกุลจริง
#         'user_type',        # ประเภทผู้ใช้
#         'house_number',     # บ้านเลขที่
#         'phone_number',     # เบอร์โทร
#         'raw_password',     # รหัสผ่านตัวจริง (สะดวกเวลานิติจะแจ้งลูกบ้าน)
#         'created_at'        # วันที่สมัคร
#     )

#     # 2. ตัวกรองด้านข้าง (Filter)
#     list_filter = ('user_type', 'created_at')

#     # 3. ช่องค้นหา (Search) ค้นหาข้ามตารางไปยัง User หลักได้
#     search_fields = (
#         'user__username', 
#         'user__first_name', 
#         'user__last_name', 
#         'house_number', 
#         'phone_number'
#     )

#     # 4. ฟังก์ชันเสริมสำหรับดึงข้อมูลจากตาราง User หลัก
#     def get_username(self, obj):
#         return obj.user.username
#     get_username.short_description = 'Username'

#     def get_full_name(self, obj):
#         return f"{obj.user.first_name} {obj.user.last_name}"
#     get_full_name.short_description = 'ชื่อ-นามสกุล'

#     # 5. ทำให้ฟิลด์บางตัวเป็น Read-Only ในหน้าแก้ไข (ถ้าต้องการ)
#     # readonly_fields = ('created_at',)

from django.contrib import admin
from .models import UserProfile, MaintenanceRequest, Announcement


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):

    list_display = (
        "get_username",
        "get_full_name",
        "get_role",
        "specialty",
        "house_number",
        "phone_number",
        "raw_password",
        "created_at"
    )

    list_filter = (
        "user_type",
        "specialty",
        "created_at"
    )

    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "house_number",
        "phone_number"
    )

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = "Username"

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = "ชื่อ-นามสกุล"

    def get_role(self, obj):
        return obj.get_user_type_display()
    get_role.short_description = "ประเภทผู้ใช้"


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ("request_code", "category", "status", "priority", "deadline", "approved_completion", "created_at")
    list_filter = ("status", "priority", "approved_completion", "category")
    search_fields = ("request_code", "description")


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "priority", "is_active", "created_at")
    list_filter = ("type", "priority", "is_active")
    search_fields = ("title", "message")