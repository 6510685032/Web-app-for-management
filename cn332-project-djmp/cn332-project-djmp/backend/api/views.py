from django.conf import settings
from django.contrib.auth import authenticate, logout
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_time, parse_datetime

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

try:
    from .models import UserProfile, MaintenanceRequest, MaintenanceRequestImage, Announcement
    HAS_ANNOUNCEMENT_MODEL = True
except ImportError:
    from .models import UserProfile, MaintenanceRequest, MaintenanceRequestImage
    Announcement = None
    HAS_ANNOUNCEMENT_MODEL = False


N8N_SECRET_TOKEN = getattr(
    settings,
    "N8N_SECRET_TOKEN",
    "a21a47ce027fa1bbbd180291ad3a7898a3e7e5261b8a38a562b17d3cac663caf",
)

ALLOWED_ROLES = {"resident", "officer", "technician", "admin"}
REQUEST_STATUSES = {"pending", "assigned", "in-progress", "completed", "cancelled"}
TECHNICIAN_ALLOWED_STATUSES = {"assigned", "in-progress", "completed"}
REQUEST_PRIORITIES = {"low", "medium", "high"}
APPROVAL_STATUSES = {"pending_approval", "approved", "rejected"}


def model_has_field(model_cls, field_name: str) -> bool:
    return any(getattr(field, "name", None) == field_name for field in model_cls._meta.get_fields())


def split_full_name(name: str):
    name = (name or "").strip()
    if not name:
        return "", ""

    parts = name.split()
    first_name = parts[0]
    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    return first_name, last_name


def generate_unique_username(base_username: str) -> str:
    base_username = (base_username or "").strip().lower()
    if not base_username:
        base_username = "user"

    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}_{counter}"
        counter += 1

    return username


def get_or_create_profile(user_obj: User):
    profile, _ = UserProfile.objects.get_or_create(user=user_obj)
    return profile


def get_user_role(user_obj: User) -> str:
    profile = UserProfile.objects.filter(user=user_obj).first()
    return profile.user_type if profile and getattr(profile, "user_type", None) else "resident"


def user_has_role(user_obj: User, *roles: str) -> bool:
    return get_user_role(user_obj) in roles


def set_field_if_exists(instance, field_name: str, value):
    if model_has_field(instance.__class__, field_name):
        setattr(instance, field_name, value)


def get_field_value(instance, field_name: str, default=None):
    if not instance:
        return default
    if model_has_field(instance.__class__, field_name):
        return getattr(instance, field_name, default)
    return default


def safe_image_urls(obj):
    if not hasattr(obj, "images"):
        return []

    urls = []
    try:
        for item in obj.images.all():
            if getattr(item, "image", None):
                urls.append(item.image.url)
    except Exception:
        pass
    return urls


def serialize_user(user_obj: User, profile=None):
    if profile is None:
        profile = UserProfile.objects.filter(user=user_obj).first()

    data = {
        "id": user_obj.id,
        "username": user_obj.username,
        "name": f"{user_obj.first_name} {user_obj.last_name}".strip() or user_obj.username,
        "email": user_obj.email or "",
        "role": profile.user_type if profile and getattr(profile, "user_type", None) else "resident",
        "phone": get_field_value(profile, "phone_number", "") or "",
        "unit_number": get_field_value(profile, "house_number", "") or "",
        "joinDate": user_obj.date_joined.strftime("%Y-%m-%d") if user_obj.date_joined else None,
    }

    if model_has_field(UserProfile, "specialty"):
        data["specialty"] = get_field_value(profile, "specialty", "") or ""

    return data


def serialize_request(req, include_resident=True):
    resident_profile = UserProfile.objects.filter(user=req.resident).first() if getattr(req, "resident", None) else None

    technician_name = "-"
    technician_phone = ""
    technician_email = ""
    technician_id = None

    if getattr(req, "assigned_technician", None):
        technician_id = req.assigned_technician_id
        technician_name = (
            f"{req.assigned_technician.first_name} {req.assigned_technician.last_name}".strip()
            or req.assigned_technician.username
        )
        tech_profile = UserProfile.objects.filter(user=req.assigned_technician).first()
        technician_phone = get_field_value(tech_profile, "phone_number", "") or ""
        technician_email = req.assigned_technician.email or ""

    data = {
        "id": req.id,
        "request_code": getattr(req, "request_code", f"REQ-{req.id}"),
        "category": getattr(req, "category", ""),
        "description": getattr(req, "description", ""),
        "status": getattr(req, "status", ""),
        "priority": getattr(req, "priority", ""),
        "location": getattr(req, "location", ""),
        "created_at": req.created_at.strftime("%Y-%m-%d") if getattr(req, "created_at", None) else None,
        "scheduled_date": req.scheduled_date.strftime("%Y-%m-%d") if getattr(req, "scheduled_date", None) else None,
        "scheduled_time": req.scheduled_time.strftime("%H:%M:%S") if getattr(req, "scheduled_time", None) else None,
        "technician": technician_name,
        "technician_phone": technician_phone,
        "technician_email": technician_email,
        "technician_id": technician_id,
        "images": safe_image_urls(req),
    }

    if include_resident and getattr(req, "resident", None):
        data["resident"] = f"{req.resident.first_name} {req.resident.last_name}".strip() or req.resident.username
        data["resident_id"] = req.resident_id
        data["unit"] = get_field_value(resident_profile, "house_number", "") or ""

    if model_has_field(MaintenanceRequest, "deadline"):
        data["deadline"] = req.deadline.isoformat() if getattr(req, "deadline", None) else None

    if model_has_field(MaintenanceRequest, "technician_notes"):
        data["technician_notes"] = get_field_value(req, "technician_notes", "") or ""

    if model_has_field(MaintenanceRequest, "materials_used"):
        data["materials_used"] = get_field_value(req, "materials_used", "") or ""

    if model_has_field(MaintenanceRequest, "approved_completion"):
        data["approved_completion"] = get_field_value(req, "approved_completion", "") or ""

    if model_has_field(MaintenanceRequest, "specialty_required"):
        data["specialty_required"] = get_field_value(req, "specialty_required", "") or ""

    return data


def ensure_officer_or_admin(request):
    if not user_has_role(request.user, "officer", "admin"):
        return Response(
            {"error": "Only officers or admins can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN,
        )
    return None


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def manage_users(request):
    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    if request.method == "GET":
        try:
            profiles = UserProfile.objects.select_related("user").all().order_by("-id")
            data = [serialize_user(p.user, p) for p in profiles]
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    data = request.data
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    name = (data.get("name") or "").strip()
    role = (data.get("role") or "resident").strip().lower()

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if role not in ALLOWED_ROLES:
        return Response(
            {"error": "Invalid role"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    first_name, last_name = split_full_name(name)
    base_username = email.split("@")[0] if "@" in email else email
    username = generate_unique_username(base_username)

    try:
        with transaction.atomic():
            user_obj = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            profile = get_or_create_profile(user_obj)
            profile.user_type = role
            set_field_if_exists(profile, "phone_number", (data.get("phone") or "").strip())
            set_field_if_exists(profile, "house_number", (data.get("unit_number") or "").strip())
            set_field_if_exists(profile, "address", (data.get("address") or "").strip())
            if model_has_field(UserProfile, "specialty"):
                set_field_if_exists(profile, "specialty", (data.get("specialty") or "").strip())
            profile.save()

        return Response(
            {"message": "User created", "id": user_obj.id, "user": serialize_user(user_obj, profile)},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    try:
        user_obj = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    profile = get_or_create_profile(user_obj)

    if request.method == "DELETE":
        user_obj.delete()
        return Response({"message": "User deleted"})

    data = request.data
    new_email = (data.get("email") or user_obj.email or "").strip().lower()
    role = (data.get("role") or profile.user_type or "resident").strip().lower()

    if role not in ALLOWED_ROLES:
        return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

    if new_email and new_email != (user_obj.email or "").lower():
        if User.objects.filter(email__iexact=new_email).exclude(id=user_obj.id).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user_obj.email = new_email

    name = (data.get("name") or "").strip()
    if name:
        first_name, last_name = split_full_name(name)
        user_obj.first_name = first_name
        user_obj.last_name = last_name

    new_password = data.get("password")
    if new_password:
        user_obj.set_password(new_password)

    try:
        with transaction.atomic():
            user_obj.save()

            profile.user_type = role
            if "phone" in data:
                set_field_if_exists(profile, "phone_number", (data.get("phone") or "").strip())
            if "unit_number" in data:
                set_field_if_exists(profile, "house_number", (data.get("unit_number") or "").strip())
            if "address" in data:
                set_field_if_exists(profile, "address", (data.get("address") or "").strip())
            if model_has_field(UserProfile, "specialty") and "specialty" in data:
                set_field_if_exists(profile, "specialty", (data.get("specialty") or "").strip())
            profile.save()

        return Response({"message": "User updated", "user": serialize_user(user_obj, profile)})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def create_user_from_n8n(request):
    secret_token = request.headers.get("X-N8N-TOKEN")
    if secret_token != N8N_SECRET_TOKEN:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    data = request.data
    password = (data.get("password") or "").strip()
    user_type = (data.get("user_type") or "").strip().lower()
    email = (data.get("email") or "").strip().lower()
    incoming_username = (data.get("username") or "").strip().lower()

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    phone_number = (data.get("phone_number") or "").strip()
    house_number = (data.get("house_number") or "").strip()
    address = (data.get("address") or "").strip()
    specialty = (data.get("specialty") or "").strip()

    if not password or not user_type:
        return Response(
            {"error": "password and user_type are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if user_type not in ALLOWED_ROLES:
        return Response(
            {"error": "Invalid user_type"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    existing_user = None

    if email:
        existing_user = User.objects.filter(email__iexact=email).first()

    if not existing_user and incoming_username:
        existing_user = User.objects.filter(username__iexact=incoming_username).first()

    if not existing_user and user_type == "resident" and house_number:
        existing_profile = (
            UserProfile.objects.select_related("user")
            .filter(user_type="resident", house_number=house_number)
            .first()
        )
        if existing_profile:
            existing_user = existing_profile.user

    if existing_user:
        try:
            with transaction.atomic():
                if email:
                    email_owner = User.objects.filter(email__iexact=email).exclude(id=existing_user.id).first()
                    if email_owner:
                        return Response(
                            {"error": f"Email '{email}' already belongs to another user"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    existing_user.email = email

                if incoming_username and incoming_username != (existing_user.username or "").lower():
                    username_owner = (
                        User.objects.filter(username__iexact=incoming_username)
                        .exclude(id=existing_user.id)
                        .first()
                    )
                    if username_owner:
                        return Response(
                            {"error": f"Username '{incoming_username}' already belongs to another user"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    existing_user.username = incoming_username

                existing_user.first_name = first_name
                existing_user.last_name = last_name
                existing_user.set_password(password)
                existing_user.save()

                profile = get_or_create_profile(existing_user)
                profile.user_type = user_type
                set_field_if_exists(profile, "phone_number", phone_number)
                set_field_if_exists(profile, "house_number", house_number)
                set_field_if_exists(profile, "address", address)
                set_field_if_exists(profile, "raw_password", password)
                if model_has_field(UserProfile, "specialty"):
                    set_field_if_exists(profile, "specialty", specialty)
                profile.save()

            return Response(
                {
                    "message": "Existing user updated",
                    "id": existing_user.id,
                    "username": existing_user.username,
                    "role": profile.user_type,
                    "email": existing_user.email,
                    "raw_password": get_field_value(profile, "raw_password", ""),
                    "created": False,
                    "updated": True,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if incoming_username:
        base_username = incoming_username
    elif email:
        base_username = email.split("@")[0]
    elif house_number:
        base_username = f"{user_type}_{house_number}"
    else:
        base_username = user_type

    username = generate_unique_username(base_username)

    try:
        with transaction.atomic():
            user_obj = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email if email else "",
            )

            profile = get_or_create_profile(user_obj)
            profile.user_type = user_type
            set_field_if_exists(profile, "phone_number", phone_number)
            set_field_if_exists(profile, "house_number", house_number)
            set_field_if_exists(profile, "address", address)
            set_field_if_exists(profile, "raw_password", password)
            if model_has_field(UserProfile, "specialty"):
                set_field_if_exists(profile, "specialty", specialty)
            profile.save()

        return Response(
            {
                "message": "User created",
                "id": user_obj.id,
                "username": user_obj.username,
                "role": profile.user_type,
                "email": user_obj.email,
                "raw_password": get_field_value(profile, "raw_password", ""),
                "created": True,
                "updated": False,
            },
            status=status.HTTP_201_CREATED,
        )
    except IntegrityError as e:
        return Response(
            {
                "error": "Failed to create user because username or email already exists",
                "detail": str(e),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    identifier = (request.data.get("username") or "").strip()
    password = request.data.get("password", "")

    if not identifier or not password:
        return Response(
            {"message": "Username/email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_obj = authenticate(username=identifier, password=password)

    if not user_obj:
        user_by_email = User.objects.filter(email__iexact=identifier).first()
        if user_by_email:
            user_obj = authenticate(username=user_by_email.username, password=password)

    if not user_obj:
        return Response(
            {"message": "Invalid username, email, or password"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile = UserProfile.objects.filter(user=user_obj).first()
    refresh = RefreshToken.for_user(user_obj)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": serialize_user(user_obj, profile),
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    user_obj = request.user
    profile = get_or_create_profile(user_obj)

    if request.method == "GET":
        return Response({"user": serialize_user(user_obj, profile)})

    data = request.data

    name = (data.get("name") or "").strip()
    if name:
        first_name, last_name = split_full_name(name)
        user_obj.first_name = first_name
        user_obj.last_name = last_name

    if "email" in data:
        new_email = (data.get("email") or "").strip().lower()
        if new_email and new_email != (user_obj.email or "").lower():
            if User.objects.filter(email__iexact=new_email).exclude(id=user_obj.id).exists():
                return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
            user_obj.email = new_email

    try:
        with transaction.atomic():
            user_obj.save()

            if "phone" in data:
                set_field_if_exists(profile, "phone_number", (data.get("phone") or "").strip())

            if "unit_number" in data:
                set_field_if_exists(profile, "house_number", (data.get("unit_number") or "").strip())

            if "address" in data:
                set_field_if_exists(profile, "address", (data.get("address") or "").strip())

            if model_has_field(UserProfile, "specialty") and "specialty" in data:
                set_field_if_exists(profile, "specialty", (data.get("specialty") or "").strip())

            profile.save()

        return Response({"message": "Profile updated", "user": serialize_user(user_obj, profile)})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def maintenance_requests(request):
    user_obj = request.user
    user_role = get_user_role(user_obj)

    if request.method == "GET":
        try:
            if user_role == "resident":
                queryset = (
                    MaintenanceRequest.objects.filter(resident=user_obj)
                    .select_related("resident", "assigned_technician")
                    .prefetch_related("images")
                    .order_by("-created_at")
                )
            elif user_role == "technician":
                queryset = (
                    MaintenanceRequest.objects.filter(assigned_technician=user_obj)
                    .select_related("resident", "assigned_technician")
                    .prefetch_related("images")
                    .order_by("-created_at")
                )
            else:
                queryset = (
                    MaintenanceRequest.objects.select_related("resident", "assigned_technician")
                    .prefetch_related("images")
                    .order_by("-created_at")
                )

            data = [serialize_request(req) for req in queryset]
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if user_role != "resident":
        return Response(
            {"error": "Only residents can create maintenance requests"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        category = (request.data.get("category") or "").strip()
        location = (request.data.get("location") or "").strip()
        description = (request.data.get("description") or "").strip()
        priority = (request.data.get("priority") or "medium").strip().lower()
        specialty_required = (request.data.get("specialty_required") or "").strip()

        if not category or not location or not description:
            return Response(
                {"error": "Category, location and description are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if priority not in REQUEST_PRIORITIES:
            priority = "medium"

        create_kwargs = {
            "resident": user_obj,
            "category": category,
            "location": location,
            "description": description,
            "priority": priority,
            "status": "pending",
        }

        if model_has_field(MaintenanceRequest, "specialty_required"):
            create_kwargs["specialty_required"] = specialty_required

        maintenance_request = MaintenanceRequest.objects.create(**create_kwargs)

        uploaded_images = request.FILES.getlist("images")
        for image in uploaded_images:
            if getattr(image, "content_type", "").startswith("image/"):
                MaintenanceRequestImage.objects.create(
                    maintenance_request=maintenance_request,
                    image=image,
                )

        return Response(
            {
                "message": "Maintenance request created successfully",
                "request": {
                    "id": maintenance_request.id,
                    "request_code": getattr(maintenance_request, "request_code", f"REQ-{maintenance_request.id}"),
                    "status": maintenance_request.status,
                },
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def maintenance_request_detail(request, pk):
    user_obj = request.user
    user_role = get_user_role(user_obj)

    try:
        req = (
            MaintenanceRequest.objects.select_related("resident", "assigned_technician")
            .prefetch_related("images")
            .get(pk=pk)
        )
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    if user_role == "resident" and req.resident_id != user_obj.id:
        return Response(
            {"error": "You do not have permission to view this request"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if user_role == "technician" and getattr(req, "assigned_technician_id", None) != user_obj.id:
        return Response(
            {"error": "You do not have permission to view this request"},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(serialize_request(req))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    user_obj = request.user

    if not user_has_role(user_obj, "technician"):
        return Response(
            {"error": "Only technicians can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        tasks = (
            MaintenanceRequest.objects.filter(assigned_technician=user_obj)
            .select_related("resident", "assigned_technician")
            .prefetch_related("images")
            .order_by("-created_at")
        )
        data = [serialize_request(task) for task in tasks]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    user_obj = request.user

    if not user_has_role(user_obj, "technician"):
        return Response(
            {"error": "Only technicians can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        task = (
            MaintenanceRequest.objects.select_related("resident", "assigned_technician")
            .prefetch_related("images")
            .get(pk=pk, assigned_technician=user_obj)
        )
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(serialize_request(task))

    data = request.data
    new_status = (data.get("status") or "").strip()
    technician_notes = data.get("technician_notes")
    materials_used = data.get("materials_used")

    if new_status:
        if new_status not in TECHNICIAN_ALLOWED_STATUSES:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        task.status = new_status

        if model_has_field(MaintenanceRequest, "approved_completion") and new_status == "completed":
            task.approved_completion = "pending_approval"

    if technician_notes is not None and model_has_field(MaintenanceRequest, "technician_notes"):
        task.technician_notes = technician_notes

    if materials_used is not None and model_has_field(MaintenanceRequest, "materials_used"):
        task.materials_used = materials_used

    uploaded_after_images = request.FILES.getlist("after_images")
    for image in uploaded_after_images:
        if getattr(image, "content_type", "").startswith("image/"):
            MaintenanceRequestImage.objects.create(
                maintenance_request=task,
                image=image,
            )

    task.save()

    return Response(
        {
            "message": "Task updated successfully",
            "task": serialize_request(task),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_task_extension(request, pk):
    user_obj = request.user

    if not user_has_role(user_obj, "technician"):
        return Response(
            {"error": "Only technicians can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        task = MaintenanceRequest.objects.get(pk=pk, assigned_technician=user_obj)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    days = request.data.get("days")
    reason = (request.data.get("reason") or "").strip()

    if not days or not reason:
        return Response(
            {"error": "Days and reason are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Extension request submitted successfully",
            "task_id": task.id,
            "days": days,
            "reason": reason,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response({"status": "success", "message": "Logged out"})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def announcements_view(request):
    if not HAS_ANNOUNCEMENT_MODEL:
        return Response(
            {"error": "Announcement model is not available in this project"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    if request.method == "GET":
        try:
            queryset = Announcement.objects.all().order_by("-created_at")
            if model_has_field(Announcement, "is_active"):
                queryset = queryset.filter(is_active=True)

            data = []
            for ann in queryset:
                item = {
                    "id": ann.id,
                    "title": ann.title,
                    "message": ann.message,
                    "created_at": ann.created_at.isoformat() if getattr(ann, "created_at", None) else None,
                    "date": ann.created_at.strftime("%B %d, %Y") if getattr(ann, "created_at", None) else None,
                }
                if model_has_field(Announcement, "type"):
                    item["type"] = get_field_value(ann, "type", "info") or "info"
                if model_has_field(Announcement, "priority"):
                    item["priority"] = get_field_value(ann, "priority", "medium") or "medium"
                data.append(item)

            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    title = (request.data.get("title") or "").strip()
    message = (request.data.get("message") or "").strip()
    ann_type = (request.data.get("type") or "info").strip()
    priority = (request.data.get("priority") or "medium").strip()

    if not title or not message:
        return Response({"error": "Title and message are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        create_kwargs = {
            "title": title,
            "message": message,
        }
        if model_has_field(Announcement, "type"):
            create_kwargs["type"] = ann_type
        if model_has_field(Announcement, "priority"):
            create_kwargs["priority"] = priority
        if model_has_field(Announcement, "created_by"):
            create_kwargs["created_by"] = request.user
        if model_has_field(Announcement, "is_active"):
            create_kwargs["is_active"] = True

        ann = Announcement.objects.create(**create_kwargs)

        return Response(
            {"message": "Announcement created", "id": ann.id},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def manage_request_status(request, pk):
    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    try:
        req = MaintenanceRequest.objects.get(pk=pk)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data

    new_status = (data.get("status") or "").strip()
    if new_status:
        if new_status not in REQUEST_STATUSES:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        req.status = new_status

    new_priority = (data.get("priority") or "").strip().lower()
    if new_priority:
        if new_priority not in REQUEST_PRIORITIES:
            return Response({"error": "Invalid priority"}, status=status.HTTP_400_BAD_REQUEST)
        req.priority = new_priority

    technician_id = data.get("technician_id")
    if technician_id:
        try:
            tech_user = User.objects.get(pk=technician_id)
        except User.DoesNotExist:
            return Response({"error": "Technician not found"}, status=status.HTTP_404_NOT_FOUND)

        tech_profile = UserProfile.objects.filter(user=tech_user).first()
        if not tech_profile or tech_profile.user_type != "technician":
            return Response({"error": "Selected user is not a technician"}, status=status.HTTP_400_BAD_REQUEST)

        req.assigned_technician = tech_user
        if req.status == "pending":
            req.status = "assigned"

    if model_has_field(MaintenanceRequest, "deadline") and "deadline" in data:
        deadline_str = (data.get("deadline") or "").strip()
        if deadline_str:
            parsed_deadline = parse_datetime(deadline_str)
            if not parsed_deadline:
                return Response({"error": "Invalid deadline format"}, status=status.HTTP_400_BAD_REQUEST)
            req.deadline = parsed_deadline
        else:
            req.deadline = None

    if "scheduled_date" in data:
        scheduled_date_str = (data.get("scheduled_date") or "").strip()
        if scheduled_date_str:
            parsed_date = parse_date(scheduled_date_str)
            if not parsed_date:
                return Response({"error": "Invalid scheduled_date format"}, status=status.HTTP_400_BAD_REQUEST)
            req.scheduled_date = parsed_date
        else:
            req.scheduled_date = None

    if "scheduled_time" in data:
        scheduled_time_str = (data.get("scheduled_time") or "").strip()
        if scheduled_time_str:
            parsed_time = parse_time(scheduled_time_str)
            if not parsed_time:
                return Response({"error": "Invalid scheduled_time format"}, status=status.HTTP_400_BAD_REQUEST)
            req.scheduled_time = parsed_time
        else:
            req.scheduled_time = None

    if model_has_field(MaintenanceRequest, "specialty_required") and "specialty_required" in data:
        req.specialty_required = (data.get("specialty_required") or "").strip()

    if model_has_field(MaintenanceRequest, "approved_completion") and "approved_completion" in data:
        approved_completion = (data.get("approved_completion") or "").strip()
        if approved_completion:
            if approved_completion not in APPROVAL_STATUSES:
                return Response({"error": "Invalid approved_completion value"}, status=status.HTTP_400_BAD_REQUEST)
            req.approved_completion = approved_completion
            if approved_completion == "rejected":
                req.status = "in-progress"

    req.save()

    return Response(
        {
            "message": "Request updated successfully",
            "request": serialize_request(req),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    all_requests = MaintenanceRequest.objects.all()
    now = timezone.now()

    total = all_requests.count()
    pending = all_requests.filter(status="pending").count()
    assigned = all_requests.filter(status="assigned").count()
    in_progress = all_requests.filter(status="in-progress").count()
    completed = all_requests.filter(status="completed").count()
    cancelled = all_requests.filter(status="cancelled").count()

    overdue = 0
    if model_has_field(MaintenanceRequest, "deadline"):
        overdue = (
            all_requests.filter(deadline__lt=now)
            .exclude(status__in=["completed", "cancelled"])
            .count()
        )

    pending_approval = 0
    approved = 0
    rejected = 0
    if model_has_field(MaintenanceRequest, "approved_completion"):
        pending_approval = all_requests.filter(approved_completion="pending_approval").count()
        approved = all_requests.filter(approved_completion="approved").count()
        rejected = all_requests.filter(approved_completion="rejected").count()

    stats = {
        "total": total,
        "pending": pending,
        "assigned": assigned,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled,
        "overdue": overdue,
        "pending_approval": pending_approval,
        "approved": approved,
        "rejected": rejected,
    }

    if HAS_ANNOUNCEMENT_MODEL:
        announcements = Announcement.objects.all()
        if model_has_field(Announcement, "is_active"):
            announcements = announcements.filter(is_active=True)
        stats["active_announcements"] = announcements.count()

    stats["technicians"] = UserProfile.objects.filter(user_type="technician").count()

    return Response(stats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def technician_schedule(request):
    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    technician_profiles = UserProfile.objects.filter(user_type="technician").select_related("user")
    data = []

    for tp in technician_profiles:
        tech_user = tp.user
        full_name = f"{tech_user.first_name} {tech_user.last_name}".strip() or tech_user.username

        tasks = (
            MaintenanceRequest.objects.filter(assigned_technician=tech_user)
            .exclude(status__in=["completed", "cancelled"])
            .select_related("resident")
            .order_by("scheduled_date", "priority")
        )

        task_list = []
        for task in tasks:
            item = serialize_request(task)
            task_list.append(item)

        data.append(
            {
                "id": tech_user.id,
                "name": full_name,
                "specialty": get_field_value(tp, "specialty", "General") or "General",
                "phone": get_field_value(tp, "phone_number", "") or "",
                "active_tasks": len(task_list),
                "tasks": task_list,
            }
        )

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_technicians(request):
    deny = ensure_officer_or_admin(request)
    if deny:
        return deny

    technician_profiles = UserProfile.objects.filter(user_type="technician").select_related("user")
    data = []

    for tp in technician_profiles:
        tech_user = tp.user
        full_name = f"{tech_user.first_name} {tech_user.last_name}".strip() or tech_user.username

        active_count = (
            MaintenanceRequest.objects.filter(assigned_technician=tech_user)
            .exclude(status__in=["completed", "cancelled"])
            .count()
        )
        completed_count = MaintenanceRequest.objects.filter(
            assigned_technician=tech_user,
            status="completed",
        ).count()

        data.append(
            {
                "id": tech_user.id,
                "name": full_name,
                "specialty": get_field_value(tp, "specialty", "General") or "General",
                "phone": get_field_value(tp, "phone_number", "") or "",
                "email": tech_user.email or "",
                "active_tasks": active_count,
                "completed_tasks": completed_count,
            }
        )

    return Response(data)
