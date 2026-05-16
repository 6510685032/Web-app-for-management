from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from api import views

urlpatterns = [
    path("admin/", admin.site.urls),

    # =========================
    # Auth / User
    # =========================
    path("api/create-user/", views.create_user_from_n8n, name="create_user_from_n8n"),
    path("api/users/", views.manage_users, name="manage_users"),
    path("api/users/<int:pk>/", views.user_detail, name="user_detail"),
    path("api/login/", views.login_view, name="login"),
    path("api/logout/", views.logout_view, name="logout"),
    path("api/me/", views.me, name="me"),

    # =========================
    # Maintenance Requests
    # =========================
    path("api/maintenance-requests/", views.maintenance_requests, name="maintenance_requests"),
    path("api/maintenance-requests/<int:pk>/", views.maintenance_request_detail, name="maintenance_request_detail"),
    path("api/maintenance-requests/<int:pk>/manage/", views.manage_request_status, name="manage_request_status"),

    # =========================
    # Tasks
    # =========================
    path("api/tasks/my/", views.my_tasks, name="my_tasks"),
    path("api/tasks/<int:pk>/", views.task_detail, name="task_detail"),
    path("api/tasks/<int:pk>/request-extension/", views.request_task_extension, name="request_task_extension"),
    path("api/maintenance-requests/<int:pk>/respond-extension/", views.respond_task_extension, name="respond_task_extension"),

    # =========================
    # Announcements
    # =========================
    path("api/announcements/", views.announcements_view, name="announcements"),

    # =========================
    # Notifications
    # =========================
    path("api/notifications/", views.list_notifications, name="list_notifications"),
    path("api/notifications/<int:pk>/", views.delete_notification, name="delete_notification"),
    path("api/notifications/<int:pk>/mark-read/", views.mark_notification_read, name="mark_notification_read"),
    path("api/notifications/mark-all-read/", views.mark_all_notifications_read, name="mark_all_notifications_read"),

    # =========================
    # Dashboard / Technician
    # =========================
    path("api/dashboard-stats/", views.dashboard_stats, name="dashboard_stats"),
    path("api/technician-schedule/", views.technician_schedule, name="technician_schedule"),
    path("api/technicians/", views.list_technicians, name="list_technicians"),

    # =========================
    # React SPA fallback
    # =========================
    re_path(
        r"^(?!api/|static/|media/|admin/).*$",
        TemplateView.as_view(template_name="index.html"),
        name="spa",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
