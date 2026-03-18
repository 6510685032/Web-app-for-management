from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout

from .models import UserProfile, MaintenanceRequest, MaintenanceRequestImage


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
            return Response({"error": str(e)}, status=500)

    if request.method == 'POST':
        data = request.data
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "").strip()

        if not email or not password:
            return Response({"error": "Email and password required"}, status=400)

        name_parts = name.split(" ")
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        base_username = email.split("@")[0]
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

        user_obj.email = data.get("email", user_obj.email)
        name = data.get("name", "").strip()

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
    username = data.get("user")
    password = data.get("password")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username exists"}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            email=data.get("email", "")
        )

        profile = user.profile
        profile.user_type = data.get("user_type", "resident")
        profile.phone_number = data.get("phone_number", "")
        profile.house_number = data.get("house_number") or ""
        profile.address = data.get("address")
        profile.save()

        return Response({"message": "User created"}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================================
# 4. LOGIN
# =========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get("username", "").strip()
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

        name = data.get("name", "").strip()
        if name:
            name_parts = name.split(" ")
            user_obj.first_name = name_parts[0]
            user_obj.last_name = " ".join(name_parts[1:])

        if "email" in data:
            user_obj.email = data.get("email", user_obj.email)

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
                return Response({"error": "Invalid status"}, status=400)
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
        return Response({"error": "Only technicians can access this endpoint"}, status=403)

    try:
        task = MaintenanceRequest.objects.get(pk=pk, assigned_technician=user_obj)
    except MaintenanceRequest.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

    days = request.data.get("days")
    reason = request.data.get("reason", "").strip()

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