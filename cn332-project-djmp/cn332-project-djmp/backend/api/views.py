from django.contrib.auth import authenticate, logout
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, MaintenanceRequest, MaintenanceRequestImage


N8N_SECRET_TOKEN = "a21a47ce027fa1bbbd180291ad3a7898a3e7e5261b8a38a562b17d3cac663caf"
ALLOWED_ROLES = {"resident", "officer", "technician", "admin"}


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


# =========================================
# 1. GET USERS + CREATE USER FROM REACT
# =========================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_users(request):
    if request.method == 'GET':
        try:
            profiles = UserProfile.objects.select_related('user').all().order_by('-id')
            data = []

            for p in profiles:
                full_name = f"{p.user.first_name} {p.user.last_name}".strip()
                unit = p.house_number if p.house_number else ""

                data.append({
                    "id": p.user.id,
                    "username": p.user.username,
                    "name": full_name if full_name else p.user.username,
                    "email": p.user.email,
                    "role": p.user_type,
                    "phone": p.phone_number,
                    "unit_number": unit,
                    "joinDate": p.user.date_joined.strftime('%Y-%m-%d') if p.user.date_joined else None
                })

            return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'POST':
        data = request.data
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")
        name = (data.get("name") or "").strip()

        if not email or not password:
            return Response(
                {"error": "Email and password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        first_name, last_name = split_full_name(name)

        base_username = email.split("@")[0].strip().lower() if "@" in email else email
        username = generate_unique_username(base_username)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )

                profile = get_or_create_profile(user)
                profile.user_type = data.get("role", "resident")
                profile.phone_number = data.get("phone", "")
                profile.house_number = data.get("unit_number", "")
                profile.address = data.get("address") or ""
                profile.save()

            return Response({
                "message": "User created",
                "id": user.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# =========================================
# 2. UPDATE + DELETE USER
# =========================================
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    try:
        user_obj = User.objects.get(id=pk)
        profile = UserProfile.objects.get(user=user_obj)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        data = request.data

        new_email = (data.get("email") or user_obj.email or "").strip().lower()
        if new_email and new_email != (user_obj.email or "").lower():
            if User.objects.filter(email__iexact=new_email).exclude(id=user_obj.id).exists():
                return Response(
                    {"error": "Email already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_obj.email = new_email

        name = (data.get("name") or "").strip()
        if name:
            first_name, last_name = split_full_name(name)
            user_obj.first_name = first_name
            user_obj.last_name = last_name

        new_password = data.get("password")
        if new_password:
            user_obj.set_password(new_password)

        user_obj.save()

        profile.user_type = data.get("role", profile.user_type)
        profile.phone_number = data.get("phone", profile.phone_number)
        profile.house_number = data.get("unit_number", profile.house_number)
        profile.address = data.get("address", profile.address)
        profile.save()

        return Response({"message": "User updated"})

    if request.method == "DELETE":
        user_obj.delete()
        return Response({"message": "User deleted"})


# =========================================
# 3. CREATE OR UPDATE USER FROM N8N
# =========================================
@api_view(['POST'])
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

    if not password or not user_type:
        return Response(
            {"error": "password and user_type are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if user_type not in ALLOWED_ROLES:
        return Response(
            {"error": "Invalid user_type"},
            status=status.HTTP_400_BAD_REQUEST
        )

    existing_user = None

    # 1) หา user เดิมจาก email ก่อน
    if email:
        existing_user = User.objects.filter(email__iexact=email).first()

    # 2) ถ้ายังไม่เจอ ลองหาจาก username ที่ n8n ส่งมา
    if not existing_user and incoming_username:
        existing_user = User.objects.filter(username__iexact=incoming_username).first()

    # 3) ถ้ายังไม่เจอ และเป็น resident ลองหาจาก house_number
    if not existing_user and user_type == "resident" and house_number:
        existing_profile = (
            UserProfile.objects
            .select_related("user")
            .filter(user_type="resident", house_number=house_number)
            .first()
        )
        if existing_profile:
            existing_user = existing_profile.user

    # -----------------------------
    # UPDATE USER เดิม
    # -----------------------------
    if existing_user:
        try:
            with transaction.atomic():
                if email:
                    email_owner = User.objects.filter(email__iexact=email).exclude(id=existing_user.id).first()
                    if email_owner:
                        return Response(
                            {"error": f"Email '{email}' already belongs to another user"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    existing_user.email = email

                if incoming_username and incoming_username != (existing_user.username or "").lower():
                    username_owner = User.objects.filter(username__iexact=incoming_username).exclude(id=existing_user.id).first()
                    if username_owner:
                        return Response(
                            {"error": f"Username '{incoming_username}' already belongs to another user"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    existing_user.username = incoming_username

                existing_user.first_name = first_name
                existing_user.last_name = last_name
                existing_user.set_password(password)
                existing_user.save()

                profile = get_or_create_profile(existing_user)
                profile.user_type = user_type
                profile.phone_number = phone_number
                profile.house_number = house_number
                profile.address = address
                profile.raw_password = password
                profile.save()

            return Response({
                "message": "Existing user updated",
                "id": existing_user.id,
                "username": existing_user.username,
                "role": profile.user_type,
                "email": existing_user.email,
                "raw_password": profile.raw_password,
                "created": False,
                "updated": True
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # -----------------------------
    # CREATE USER ใหม่
    # -----------------------------
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
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email if email else ""
            )

            profile = get_or_create_profile(user)
            profile.user_type = user_type
            profile.phone_number = phone_number
            profile.house_number = house_number
            profile.address = address
            profile.raw_password = password
            profile.save()

        return Response({
            "message": "User created",
            "id": user.id,
            "username": user.username,
            "role": profile.user_type,
            "email": user.email,
            "raw_password": profile.raw_password,
            "created": True,
            "updated": False
        }, status=status.HTTP_201_CREATED)

    except IntegrityError as e:
        return Response({
            "error": "Failed to create user because username or email already exists",
            "detail": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================================
# 4. LOGIN
# =========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = (request.data.get("username") or "").strip()
    password = request.data.get("password", "")

    if not identifier or not password:
        return Response({
            "message": "Username/email and password are required"
        }, status=status.HTTP_400_BAD_REQUEST)

    user_obj = authenticate(username=identifier, password=password)

    if not user_obj:
        user_by_email = User.objects.filter(email__iexact=identifier).first()
        if user_by_email:
            user_obj = authenticate(username=user_by_email.username, password=password)

    if not user_obj:
        return Response({
            "message": "Invalid username, email, or password"
        }, status=status.HTTP_400_BAD_REQUEST)

    profile = UserProfile.objects.filter(user_id=user_obj.id).first()

    unit = profile.house_number if profile and profile.house_number else ""
    phone = profile.phone_number if profile and profile.phone_number else ""

    refresh = RefreshToken.for_user(user_obj)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user_obj.id,
            "username": user_obj.username,
            "name": f"{user_obj.first_name} {user_obj.last_name}".strip(),
            "email": user_obj.email,
            "role": profile.user_type if profile else "resident",
            "phone": phone,
            "unit_number": unit,
            "joinDate": user_obj.date_joined.strftime("%Y-%m-%d")
        }
    })


# =========================================
# 5. MY PROFILE
# =========================================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    user_obj = request.user
    profile = UserProfile.objects.filter(user=user_obj).first()

    if request.method == 'GET':
        return Response({
            "user": {
                "id": user_obj.id,
                "username": user_obj.username,
                "name": f"{user_obj.first_name} {user_obj.last_name}".strip(),
                "email": user_obj.email,
                "role": profile.user_type if profile else "resident",
                "phone": profile.phone_number if profile and profile.phone_number else "",
                "unit_number": profile.house_number if profile and profile.house_number else "",
                "joinDate": user_obj.date_joined.strftime("%Y-%m-%d") if user_obj.date_joined else None
            }
        })

    if request.method == 'PATCH':
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
                    return Response(
                        {"error": "Email already exists"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user_obj.email = new_email

        user_obj.save()

        if profile:
            if "phone" in data:
                profile.phone_number = data.get("phone", profile.phone_number)

            if "unit_number" in data:
                profile.house_number = data.get("unit_number", profile.house_number)

            profile.save()

        return Response({
            "message": "Profile updated",
            "user": {
                "id": user_obj.id,
                "username": user_obj.username,
                "name": f"{user_obj.first_name} {user_obj.last_name}".strip(),
                "email": user_obj.email,
                "role": profile.user_type if profile else "resident",
                "phone": profile.phone_number if profile and profile.phone_number else "",
                "unit_number": profile.house_number if profile and profile.house_number else "",
                "joinDate": user_obj.date_joined.strftime("%Y-%m-%d") if user_obj.date_joined else None
            }
        })


# =========================================
# 6. MAINTENANCE REQUESTS
# =========================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def maintenance_requests(request):
    user_obj = request.user
    profile = UserProfile.objects.filter(user=user_obj).first()
    user_role = profile.user_type if profile else "resident"

    if request.method == 'GET':
        try:
            if user_role == 'resident':
                queryset = (
                    MaintenanceRequest.objects
                    .filter(resident=user_obj)
                    .select_related('resident', 'assigned_technician')
                    .prefetch_related('images')
                    .order_by('-created_at')
                )
            else:
                queryset = (
                    MaintenanceRequest.objects
                    .select_related('resident', 'assigned_technician')
                    .prefetch_related('images')
                    .order_by('-created_at')
                )

            data = []
            for req in queryset:
                resident_profile = getattr(req.resident, "profile", None)

                technician_name = "-"
                if req.assigned_technician:
                    technician_name = f"{req.assigned_technician.first_name} {req.assigned_technician.last_name}".strip()
                    if not technician_name:
                        technician_name = req.assigned_technician.username

                data.append({
                    "id": req.id,
                    "request_code": req.request_code,
                    "category": req.category,
                    "description": req.description,
                    "status": req.status,
                    "priority": req.priority,
                    "location": req.location,
                    "created_at": req.created_at.strftime("%Y-%m-%d"),
                    "technician": technician_name,
                    "resident": f"{req.resident.first_name} {req.resident.last_name}".strip() or req.resident.username,
                    "unit": resident_profile.house_number if resident_profile and resident_profile.house_number else "",
                    "scheduled_date": req.scheduled_date.strftime("%Y-%m-%d") if req.scheduled_date else None,
                    "scheduled_time": req.scheduled_time.strftime("%H:%M:%S") if req.scheduled_time else None,
                    "images": [img.image.url for img in req.images.all() if img.image]
                })

            return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'POST':
        if user_role != 'resident':
            return Response(
                {"error": "Only residents can create maintenance requests"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            category = request.data.get("category")
            location = request.data.get("location")
            description = request.data.get("description")
            priority = request.data.get("priority", "medium")

            if not category or not location or not description:
                return Response(
                    {"error": "Category, location and description are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            maintenance_request = MaintenanceRequest.objects.create(
                resident=user_obj,
                category=category,
                location=location,
                description=description,
                priority=priority,
                status="pending"
            )

            uploaded_images = request.FILES.getlist("images")
            for image in uploaded_images:
                MaintenanceRequestImage.objects.create(
                    maintenance_request=maintenance_request,
                    image=image
                )

            return Response({
                "message": "Maintenance request created successfully",
                "request": {
                    "id": maintenance_request.id,
                    "request_code": maintenance_request.request_code,
                    "status": maintenance_request.status
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================================
# 7. MAINTENANCE REQUEST DETAIL
# =========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def maintenance_request_detail(request, pk):
    user_obj = request.user
    profile = UserProfile.objects.filter(user=user_obj).first()
    user_role = profile.user_type if profile else "resident"

    try:
        req = (
            MaintenanceRequest.objects
            .select_related('resident', 'assigned_technician')
            .prefetch_related('images')
            .get(pk=pk)
        )
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    if user_role == 'resident' and req.resident_id != user_obj.id:
        return Response(
            {"error": "You do not have permission to view this request"},
            status=status.HTTP_403_FORBIDDEN
        )

    technician_name = "-"
    technician_phone = ""
    technician_email = ""

    if req.assigned_technician:
        technician_name = f"{req.assigned_technician.first_name} {req.assigned_technician.last_name}".strip()
        if not technician_name:
            technician_name = req.assigned_technician.username

        tech_profile = getattr(req.assigned_technician, "profile", None)
        technician_phone = tech_profile.phone_number if tech_profile and tech_profile.phone_number else ""
        technician_email = req.assigned_technician.email or ""

    return Response({
        "id": req.id,
        "request_code": req.request_code,
        "category": req.category,
        "description": req.description,
        "status": req.status,
        "priority": req.priority,
        "location": req.location,
        "created_at": req.created_at.strftime("%Y-%m-%d"),
        "scheduled_date": req.scheduled_date.strftime("%Y-%m-%d") if req.scheduled_date else None,
        "scheduled_time": req.scheduled_time.strftime("%H:%M:%S") if req.scheduled_time else None,
        "technician": technician_name,
        "technician_phone": technician_phone,
        "technician_email": technician_email,
        "images": [img.image.url for img in req.images.all() if img.image],
    })


# =========================================
# 8. MY TASKS (TECHNICIAN)
# =========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    user_obj = request.user
    profile = UserProfile.objects.filter(user=user_obj).first()
    user_role = profile.user_type if profile else "resident"

    if user_role != 'technician':
        return Response(
            {"error": "Only technicians can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        tasks = (
            MaintenanceRequest.objects
            .filter(assigned_technician=user_obj)
            .select_related('resident', 'assigned_technician')
            .order_by('-created_at')
        )

        data = []
        for task in tasks:
            resident_profile = getattr(task.resident, "profile", None)

            resident_name = f"{task.resident.first_name} {task.resident.last_name}".strip()
            if not resident_name:
                resident_name = task.resident.username

            data.append({
                "id": task.id,
                "request_code": task.request_code,
                "resident": resident_name,
                "unit": resident_profile.house_number if resident_profile and resident_profile.house_number else "",
                "category": task.category,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "scheduled_date": task.scheduled_date.strftime("%Y-%m-%d") if task.scheduled_date else None,
                "scheduled_time": task.scheduled_time.strftime("%H:%M:%S") if task.scheduled_time else None,
                "location": task.location
            })

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================================
# 9. TASK DETAIL (TECHNICIAN)
# =========================================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    user_obj = request.user
    profile = UserProfile.objects.filter(user=user_obj).first()
    user_role = profile.user_type if profile else "resident"

    if user_role != 'technician':
        return Response(
            {"error": "Only technicians can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        task = (
            MaintenanceRequest.objects
            .select_related('resident', 'assigned_technician')
            .prefetch_related('images')
            .get(pk=pk, assigned_technician=user_obj)
        )
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    resident_profile = getattr(task.resident, "profile", None)
    resident_name = f"{task.resident.first_name} {task.resident.last_name}".strip()
    if not resident_name:
        resident_name = task.resident.username

    if request.method == 'GET':
        return Response({
            "id": task.id,
            "request_code": task.request_code,
            "resident": resident_name,
            "resident_phone": resident_profile.phone_number if resident_profile and resident_profile.phone_number else "",
            "resident_email": task.resident.email or "",
            "unit": resident_profile.house_number if resident_profile and resident_profile.house_number else "",
            "category": task.category,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "scheduled_date": task.scheduled_date.strftime("%Y-%m-%d") if task.scheduled_date else None,
            "scheduled_time": task.scheduled_time.strftime("%H:%M:%S") if task.scheduled_time else None,
            "location": task.location,
            "technician_notes": task.technician_notes or "",
            "images": [img.image.url for img in task.images.all() if img.image],
        })

    if request.method == 'PATCH':
        data = request.data
        new_status = data.get("status")
        technician_notes = data.get("technician_notes")

        if new_status:
            allowed_statuses = ['assigned', 'in-progress', 'completed']
            if new_status not in allowed_statuses:
                return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            task.status = new_status

        if technician_notes is not None:
            task.technician_notes = technician_notes

        uploaded_after_images = request.FILES.getlist("after_images")
        for image in uploaded_after_images:
            MaintenanceRequestImage.objects.create(
                maintenance_request=task,
                image=image
            )

        task.save()

        return Response({
            "message": "Task updated successfully",
            "id": task.id,
            "status": task.status,
            "technician_notes": task.technician_notes or "",
        })


# =========================================
# 10. REQUEST TASK EXTENSION
# =========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_task_extension(request, pk):
    user_obj = request.user
    profile = UserProfile.objects.filter(user=user_obj).first()
    user_role = profile.user_type if profile else "resident"

    if user_role != 'technician':
        return Response(
            {"error": "Only technicians can access this endpoint"},
            status=status.HTTP_403_FORBIDDEN
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
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({
        "message": "Extension request submitted successfully",
        "task_id": task.id,
        "days": days,
        "reason": reason,
    }, status=status.HTTP_201_CREATED)


# =========================================
# 11. LOGOUT
# =========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)

    return Response({
        "status": "success",
        "message": "Logged out"
    })
