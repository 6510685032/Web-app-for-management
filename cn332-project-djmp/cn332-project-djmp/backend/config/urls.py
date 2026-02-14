"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from api import views  
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 1. หน้าหลัก: แสดงผล React
    path("", TemplateView.as_view(template_name="index.html"), name='home'),
    
    # 2. Django Admin
    path('admin/', admin.site.urls),
    
    # 3. API สำหรับรับข้อมูลจาก n8n (POST)
    path('api/create-user/', views.create_user_from_n8n, name='create_user_from_n8n'),
    
    # 4. API สำหรับจัดการข้อมูลผู้ใช้ทั้งหมด (GET / POST)
    path('api/users/', views.manage_users, name='manage_users'),

    # 5. API สำหรับจัดการข้อมูลผู้ใช้รายคน (PUT / DELETE) 👈 ตัวนี้เพิ่มมาใหม่สำหรับปุ่ม Edit / Delete!
    path('api/users/<int:pk>/', views.user_detail, name='user_detail'),

    # 6. API สำหรับ Login 👈 (เพิ่ม /api/ เข้าไปให้ตรงกับ React)
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)