from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from api import views

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/create-user/", views.create_user_from_n8n, name="create_user_from_n8n"),
    path("api/users/", views.manage_users, name="manage_users"),
    path("api/users/<int:pk>/", views.user_detail, name="user_detail"),
    path("api/login/", views.login_view, name="login"),
    path("api/logout/", views.logout_view, name="logout"),
    path("api/me/", views.me, name="me"),

    path("api/maintenance-requests/", views.maintenance_requests, name="maintenance_requests"),
    path("api/maintenance-requests/<int:pk>/", views.maintenance_request_detail, name="maintenance_request_detail"),

    path("api/tasks/my/", views.my_tasks, name="my_tasks"),
    path("api/tasks/<int:pk>/", views.task_detail, name="task_detail"),
    path("api/tasks/<int:pk>/request-extension/", views.request_task_extension, name="request_task_extension"),

    re_path(
        r"^(?!api/|static/|media/|admin/).*",
        TemplateView.as_view(template_name="index.html"),
        name="spa",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)