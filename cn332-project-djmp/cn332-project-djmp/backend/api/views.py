from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout
from django.utils import timezone
from datetime import timedelta

from .models import UserProfile, MaintenanceRequest, MaintenanceRequestImage, Announcement


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
                    "specialty": p.specialty or "",
                    "joinDate": p.user.date_joined.strftime('%Y-%m-%d') if p.user.date_joined else None
                })

            return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    if request.method == 'POST':
        data = request.data
        email = (data.get("email") or "").strip()
        password = data.get("password")
        name = (data.get("name") or "").strip()

        if not email or not password:
            return Response({"error": "Email and password required"}, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "Email already exists"}, status=400)

        name_parts = name.split(" ")
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        base_username = email.split("@")[0].strip().lower()
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            profile = user.profile
            profile.user_type = data.get("role", "resident")
            profile.phone_number = data.get("phone", "")
            profile.house_number = data.get("unit_number", "")
            profile.address = data.get("address")
            profile.specialty = data.get("specialty", "")
            profile.save()

            return Response({
                "message": "User created",
                "id": user.id
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


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
        return Response({"error": "User not found"}, status=404)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    if request.method == "PUT":
        data = request.data

        new_email = data.get("email", user_obj.email)
        if new_email and new_email.lower() != (user_obj.email or "").lower():
            if User.objects.filter(email__iexact=new_email).exclude(id=user_obj.id).exists():
                return Response({"error": "Email already exists"}, status=400)
            user_obj.email = new_email

        name = (data.get("name") or "").strip()
        if name:
            name_parts = name.split(" ")
            user_obj.first_name = name_parts[0]
            user_obj.last_name = " ".join(name_parts[1:])

        new_password = data.get("password")
        if new_password:
            user_obj.set_password(new_password)

        user_obj.save()

        profile.user_type = data.get("role", profile.user_type)
        profile.phone_number = data.get("phone", profile.phone_number)
        profile.house_number = data.get("unit_number", profile.house_number)
        profile.address = data.get("address", profile.address)
        if "specialty" in data:
            profile.specialty = data.get("specialty", profile.specialty)
        profile.save()

        return Response({"message": "User updated"})

    if request.method == "DELETE":
        user_obj.delete()
        return Response({"message": "User deleted"})


# =========================================
# 3. CREATE USER FROM N8N
# =========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def create_user_from_n8n(request):
    secret_token = request.headers.get("X-N8N-TOKEN")
    if secret_token != "a21a47ce027fa1bbbd180291ad3a7898a3e7e5261b8a38a562b17d3cac663caf":
        return Response({"error": "Unauthorized"}, status=401)

    data = request.data
    password = data.get("password")
    user_type = (data.get("user_type") or "").strip().lower()
    email = (data.get("email") or "").strip().lower()

    allowed_roles = {"resident", "officer", "technician", "admin"}

    if not password or not user_type or not email:
        return Response({"error": "Email, password and user_type are required"}, status=400)

    if user_type not in allowed_roles:
        return Response({"error": "Invalid user_type"}, status=400)

    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    phone_number = data.get("phone_number", "")
    house_number = data.get("house_number") or ""
    address = data.get("address")

    existing_user = User.objects.filter(email__iexact=email).first()

    if existing_user:
        existing_user.first_name = first_name
        existing_user.last_name = last_name
        existing_user.email = email
        existing_user.set_password(password)
        existing_user.save()

        profile, _ = UserProfile.objects.get_or_create(user=existing_user)
        profile.user_type = user_type
        profile.phone_number = phone_number
        profile.house_number = house_number
        profile.address = address
        profile.raw_password = password
        profile.save()

        profile.refresh_from_db()

        return Response({
            "message": "Existing user updated",
            "id": existing_user.id,
            "username": existing_user.username,
            "role": profile.user_type,
            "email": existing_user.email,
            "raw_password": profile.raw_password,
            "created": False,
            "updated": True
        }, status=200)

    base_username = f"{user_type}_{User.objects.count() + 1}"
    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}_{counter}"
        counter += 1

    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )

        profile = user.profile
        profile.user_type = user_type
        profile.phone_number = phone_number
        profile.house_number = house_number
        profile.address = address
        profile.raw_password = password
        profile.save()

        profile.refresh_from_db()

        return Response({
            "message": "User created",
            "id": user.id,
            "username": username,
            "role": user_type,
            "email": email,
            "raw_password": profile.raw_password,
            "created": True,
            "updated": False
        }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

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
        }, status=400)

    user_obj = authenticate(username=identifier, password=password)

    if not user_obj:
        user_by_email = User.objects.filter(email__iexact=identifier).first()
        if user_by_email:
            user_obj = authenticate(username=user_by_email.username, password=password)

    if not user_obj:
        return Response({
            "message": "Invalid username, email, or password"
        }, status=400)

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
            "specialty": profile.specialty if profile else "",
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
                "specialty": profile.specialty if profile else "",
                "joinDate": user_obj.date_joined.strftime("%Y-%m-%d") if user_obj.date_joined else None
            }
        })

    if request.method == 'PATCH':
        data = request.data

        name = (data.get("name") or "").strip()
        if name:
            name_parts = name.split(" ")
            user_obj.first_name = name_parts[0]
            user_obj.last_name = " ".join(name_parts[1:])

        if "email" in data:
            new_email = (data.get("email") or "").strip()
            if new_email and new_email.lower() != (user_obj.email or "").lower():
                if User.objects.filter(email__iexact=new_email).exclude(id=user_obj.id).exists():
                    return Response({"error": "Email already exists"}, status=400)
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
                "specialty": profile.specialty if profile else "",
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
                queryset = MaintenanceRequest.objects.filter(
                    resident=user_obj
                ).select_related('resident', 'assigned_technician').prefetch_related('images').order_by('-created_at')
            else:
                queryset = MaintenanceRequest.objects.select_related(
                    'resident', 'assigned_technician'
                ).prefetch_related('images').order_by('-created_at')

            data = []
            for req in queryset:
                resident_profile = getattr(req.resident, "profile", None)
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
                    "technician_phone": technician_phone,
                    "technician_email": technician_email,
                    "technician_id": req.assigned_technician_id,
                    "resident": f"{req.resident.first_name} {req.resident.last_name}".strip() or req.resident.username,
                    "resident_id": req.resident_id,
                    "unit": resident_profile.house_number if resident_profile and resident_profile.house_number else "",
                    "scheduled_date": req.scheduled_date.strftime("%Y-%m-%d") if req.scheduled_date else None,
                    "scheduled_time": req.scheduled_time.strftime("%H:%M:%S") if req.scheduled_time else None,
                    "deadline": req.deadline.isoformat() if req.deadline else None,
                    "materials_used": req.materials_used or "",
                    "approved_completion": req.approved_completion or "",
                    "specialty_required": req.specialty_required or "",
                    "images": [img.image.url for img in req.images.all() if img.image]
                })

            return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    if request.method == 'POST':
        if user_role != 'resident':
            return Response({"error": "Only residents can create maintenance requests"}, status=403)

        try:
            category = request.data.get("category")
            location = request.data.get("location")
            description = request.data.get("description")
            priority = request.data.get("priority", "medium")

            if not category or not location or not description:
                return Response({"error": "Category, location and description are required"}, status=400)

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
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


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
        req = MaintenanceRequest.objects.select_related(
            'resident', 'assigned_technician'
        ).prefetch_related('images').get(pk=pk)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    if user_role == 'resident' and req.resident_id != user_obj.id:
        return Response({"error": "You do not have permission to view this request"}, status=403)

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
        "deadline": req.deadline.isoformat() if req.deadline else None,
        "materials_used": req.materials_used or "",
        "approved_completion": req.approved_completion or "",
        "specialty_required": req.specialty_required or "",
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
        return Response({"error": "Only technicians can access this endpoint"}, status=403)

    try:
        tasks = MaintenanceRequest.objects.filter(
            assigned_technician=user_obj
        ).select_related('resident', 'assigned_technician').order_by('-created_at')

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
                "deadline": task.deadline.isoformat() if task.deadline else None,
                "materials_used": task.materials_used or "",
                "specialty_required": task.specialty_required or "",
                "location": task.location
            })

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


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
        return Response({"error": "Only technicians can access this endpoint"}, status=403)

    try:
        task = MaintenanceRequest.objects.select_related(
            'resident', 'assigned_technician'
        ).prefetch_related('images').get(pk=pk, assigned_technician=user_obj)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

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
            "deadline": task.deadline.isoformat() if task.deadline else None,
            "location": task.location,
            "technician_notes": task.technician_notes or "",
            "materials_used": task.materials_used or "",
            "specialty_required": task.specialty_required or "",
            "images": [img.image.url for img in task.images.all() if img.image],
        })

    if request.method == 'PATCH':
        data = request.data
        new_status = data.get("status")
        technician_notes = data.get("technician_notes")
        materials_used = data.get("materials_used")

        if new_status:
            allowed_statuses = ['assigned', 'in-progress', 'completed']
            if new_status not in allowed_statuses:
                return Response({"error": "Invalid status"}, status=400)
            task.status = new_status
            # When marking as completed, set approved_completion to pending_approval
            if new_status == 'completed':
                task.approved_completion = 'pending_approval'

        if technician_notes is not None:
            task.technician_notes = technician_notes

        if materials_used is not None:
            task.materials_used = materials_used

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
            "materials_used": task.materials_used or "",
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
        return Response({"error": "Only technicians can access this endpoint"}, status=403)

    try:
        task = MaintenanceRequest.objects.get(pk=pk, assigned_technician=user_obj)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

    days = request.data.get("days")
    reason = (request.data.get("reason") or "").strip()

    if not days or not reason:
        return Response({"error": "Days and reason are required"}, status=400)

    return Response({
        "message": "Extension request submitted successfully",
        "task_id": task.id,
        "days": days,
        "reason": reason,
    }, status=201)


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


# =========================================
# 12. ANNOUNCEMENTS
# =========================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def announcements_view(request):
    if request.method == 'GET':
        try:
            items = Announcement.objects.filter(is_active=True).order_by('-created_at')
            data = []
            for a in items:
                data.append({
                    "id": a.id,
                    "title": a.title,
                    "message": a.message,
                    "type": a.type,
                    "priority": a.priority,
                    "date": a.created_at.strftime("%B %d, %Y"),
                    "created_at": a.created_at.isoformat(),
                })
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    if request.method == 'POST':
        profile = UserProfile.objects.filter(user=request.user).first()
        user_role = profile.user_type if profile else "resident"
        if user_role not in ('officer', 'admin'):
            return Response({"error": "Only officers or admins can create announcements"}, status=403)

        title = (request.data.get("title") or "").strip()
        message = (request.data.get("message") or "").strip()
        ann_type = request.data.get("type", "info")
        priority = request.data.get("priority", "medium")

        if not title or not message:
            return Response({"error": "Title and message are required"}, status=400)

        ann = Announcement.objects.create(
            title=title,
            message=message,
            type=ann_type,
            priority=priority,
            created_by=request.user,
        )

        return Response({
            "message": "Announcement created",
            "id": ann.id,
        }, status=201)


# =========================================
# 13. MANAGE REQUEST STATUS (OFFICER)
# =========================================
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def manage_request_status(request, pk):
    """Officer can assign technician, set priority, deadline, approve/reject completed work."""
    profile = UserProfile.objects.filter(user=request.user).first()
    user_role = profile.user_type if profile else "resident"

    if user_role not in ('officer', 'admin'):
        return Response({"error": "Only officers or admins can manage requests"}, status=403)

    try:
        req = MaintenanceRequest.objects.get(pk=pk)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    data = request.data

    # Update status
    new_status = data.get("status")
    if new_status:
        valid_statuses = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled']
        if new_status in valid_statuses:
            req.status = new_status

    # Update priority
    new_priority = data.get("priority")
    if new_priority and new_priority in ('low', 'medium', 'high'):
        req.priority = new_priority

    # Assign technician
    technician_id = data.get("technician_id")
    if technician_id:
        try:
            tech_user = User.objects.get(id=technician_id)
            req.assigned_technician = tech_user
            if req.status == 'pending':
                req.status = 'assigned'
        except User.DoesNotExist:
            return Response({"error": "Technician not found"}, status=404)

    # Set deadline
    deadline_str = data.get("deadline")
    if deadline_str:
        try:
            from django.utils.dateparse import parse_datetime
            parsed = parse_datetime(deadline_str)
            if parsed:
                req.deadline = parsed
        except Exception:
            pass

    # Set scheduled date/time
    scheduled_date = data.get("scheduled_date")
    if scheduled_date:
        req.scheduled_date = scheduled_date

    scheduled_time = data.get("scheduled_time")
    if scheduled_time:
        req.scheduled_time = scheduled_time

    # Approve/reject completed work
    approved_completion = data.get("approved_completion")
    if approved_completion and approved_completion in ('pending_approval', 'approved', 'rejected'):
        req.approved_completion = approved_completion
        if approved_completion == 'rejected':
            req.status = 'in-progress'

    req.save()

    return Response({
        "message": "Request updated successfully",
        "id": req.id,
        "status": req.status,
        "priority": req.priority,
        "deadline": req.deadline.isoformat() if req.deadline else None,
        "approved_completion": req.approved_completion,
    })


# =========================================
# 14. DASHBOARD STATS (OFFICER)
# =========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Returns computed stats for the officer dashboard."""
    profile = UserProfile.objects.filter(user=request.user).first()
    user_role = profile.user_type if profile else "resident"

    if user_role not in ('officer', 'admin'):
        return Response({"error": "Only officers or admins can access this endpoint"}, status=403)

    now = timezone.now()
    all_requests = MaintenanceRequest.objects.all()

    total = all_requests.count()
    pending = all_requests.filter(status='pending').count()
    assigned = all_requests.filter(status='assigned').count()
    in_progress = all_requests.filter(status='in-progress').count()
    completed = all_requests.filter(status='completed').count()
    cancelled = all_requests.filter(status='cancelled').count()

    # Overdue: has deadline, not completed/cancelled, past deadline
    overdue = all_requests.filter(
        deadline__lt=now
    ).exclude(
        status__in=['completed', 'cancelled']
    ).count()

    # Approval stats
    pending_approval = all_requests.filter(approved_completion='pending_approval').count()
    approved = all_requests.filter(approved_completion='approved').count()
    rejected = all_requests.filter(approved_completion='rejected').count()

    return Response({
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
    })


# =========================================
# 15. TECHNICIAN SCHEDULE (OFFICER)
# =========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def technician_schedule(request):
    """Returns all technicians with their assigned active tasks."""
    profile = UserProfile.objects.filter(user=request.user).first()
    user_role = profile.user_type if profile else "resident"

    if user_role not in ('officer', 'admin'):
        return Response({"error": "Only officers or admins can access this endpoint"}, status=403)

    technician_profiles = UserProfile.objects.filter(
        user_type='technician'
    ).select_related('user')

    data = []
    for tp in technician_profiles:
        tech_user = tp.user
        full_name = f"{tech_user.first_name} {tech_user.last_name}".strip() or tech_user.username

        tasks = MaintenanceRequest.objects.filter(
            assigned_technician=tech_user
        ).exclude(
            status__in=['completed', 'cancelled']
        ).select_related('resident').order_by('scheduled_date', 'priority')

        task_list = []
        for t in tasks:
            resident_profile = getattr(t.resident, "profile", None)
            resident_name = f"{t.resident.first_name} {t.resident.last_name}".strip() or t.resident.username
            task_list.append({
                "id": t.id,
                "request_code": t.request_code,
                "category": t.category,
                "description": t.description,
                "priority": t.priority,
                "status": t.status,
                "location": t.location,
                "resident": resident_name,
                "unit": resident_profile.house_number if resident_profile and resident_profile.house_number else "",
                "scheduled_date": t.scheduled_date.strftime("%Y-%m-%d") if t.scheduled_date else None,
                "deadline": t.deadline.isoformat() if t.deadline else None,
            })

        data.append({
            "id": tech_user.id,
            "name": full_name,
            "specialty": tp.specialty or "General",
            "phone": tp.phone_number or "",
            "active_tasks": len(task_list),
            "tasks": task_list,
        })

    return Response(data)


# =========================================
# 16. LIST TECHNICIANS (FOR ASSIGNMENT)
# =========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_technicians(request):
    """Returns list of all technicians with their current task counts."""
    profile = UserProfile.objects.filter(user=request.user).first()
    user_role = profile.user_type if profile else "resident"

    if user_role not in ('officer', 'admin'):
        return Response({"error": "Only officers or admins can access this"}, status=403)

    technician_profiles = UserProfile.objects.filter(
        user_type='technician'
    ).select_related('user')

    data = []
    for tp in technician_profiles:
        tech_user = tp.user
        full_name = f"{tech_user.first_name} {tech_user.last_name}".strip() or tech_user.username

        active_count = MaintenanceRequest.objects.filter(
            assigned_technician=tech_user
        ).exclude(status__in=['completed', 'cancelled']).count()

        completed_count = MaintenanceRequest.objects.filter(
            assigned_technician=tech_user,
            status='completed'
        ).count()

        data.append({
            "id": tech_user.id,
            "name": full_name,
            "specialty": tp.specialty or "General",
            "phone": tp.phone_number or "",
            "email": tech_user.email or "",
            "active_tasks": active_count,
            "completed_tasks": completed_count,
        })

    return Response(data)