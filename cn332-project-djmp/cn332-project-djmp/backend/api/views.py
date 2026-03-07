from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile
from django.contrib.auth import logout

# --- 1. API สำหรับดึงข้อมูล(GET) และ เพิ่มผู้ใช้ใหม่จาก React (POST) ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def manage_users(request):
    # กรณีดึงข้อมูล (Read)
    if request.method == 'GET':
        try:
            # ใช้ select_related เพื่อประสิทธิภาพในการดึงข้อมูลจากตาราง User
            profiles = UserProfile.objects.select_related('user').all().order_by('-id')
            data = []
            for p in profiles:
                full_name = f"{p.user.first_name} {p.user.last_name}".strip()
                data.append({
                    'id': p.user.id,
                    'username': p.user.username, # ดึง username ออกมา
                    'name': full_name if full_name else p.user.username,
                    'email': p.user.email,
                    'role': p.user_type,
                    'phone': p.phone_number,
                    'joinDate': p.user.date_joined.strftime('%Y-%m-%d') if p.user.date_joined else None,
                    # ดึงรหัสผ่านดิบจาก UserProfile (ถ้าไม่มีให้โชว์รอยขีด)
                    'password': p.raw_password if hasattr(p, 'raw_password') else "********",
                })
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    # กรณีเพิ่มข้อมูลจาก React (Create)
    elif request.method == 'POST':
        data = request.data
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', '')
        
        if not email or not password:
            return Response({'error': 'Email and Password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # แยกชื่อ-นามสกุล
        name_parts = name.split(' ')
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

        # สร้าง username อัตโนมัติจาก email
        base_username = email.split('@')[0]
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
            UserProfile.objects.create(
                user=user,
                user_type=data.get('role', 'resident'),
                phone_number=data.get('phone', ''),
                raw_password=password # เก็บ password แบบอ่านออกได้ไว้ที่นี่
            )
            return Response({'message': 'User created successfully', 'id': user.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- 2. API สำหรับแก้ไข (PUT) และ ลบ (DELETE) ผู้ใช้รายคน ---
@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
def user_detail(request, pk):
    try:
        user_obj = User.objects.get(id=pk)
        profile = UserProfile.objects.get(user=user_obj)
    except (User.DoesNotExist, UserProfile.DoesNotExist):
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        data = request.data
        
        # อัปเดตตาราง User
        user_obj.email = data.get('email', user_obj.email)
        name = data.get('name', '')
        if name:
            name_parts = name.split(' ')
            user_obj.first_name = name_parts[0]
            user_obj.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        # ถ้ามีการส่ง password มาใหม่ ให้เปลี่ยน password ด้วย
        new_password = data.get('password')
        if new_password:
            user_obj.set_password(new_password)
            profile.raw_password = new_password
            
        user_obj.save()

        # อัปเดตตาราง UserProfile
        profile.user_type = data.get('role', profile.user_type)
        profile.phone_number = data.get('phone', profile.phone_number)
        profile.save()

        return Response({'message': 'User updated successfully'})

    elif request.method == 'DELETE':
        user_obj.delete()
        return Response({'message': 'User deleted successfully'})
# --- 3. API สำหรับรับข้อมูลจาก n8n (POST) เหมือนเดิม ---
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def create_user_from_n8n(request):
#     secret_token = request.headers.get('X-N8N-TOKEN')
#     if secret_token != 'my-super-secret-token-123':
#         return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

#     data = request.data
#     email = data.get('email')
#     password = data.get('password') 
    
#     if not email or not password:
#         return Response({'error': 'Email and Password are required'}, status=status.HTTP_400_BAD_REQUEST)

#     base_username = email.split('@')[0]
#     username = base_username
#     counter = 1
#     while User.objects.filter(username=username).exists():
#         username = f"{base_username}{counter}"
#         counter += 1

#     try:
#         user = User.objects.create_user(
#             username=username, email=email, password=password,
#             first_name=data.get('first_name', ''), last_name=data.get('last_name', '')
#         )
#         UserProfile.objects.create(
#             user=user, user_type=data.get('user_type', 'resident'),
#             phone_number=data.get('phone_number', ''), raw_password=password,
#             house_number=data.get('house_number', None), address=data.get('address', None)
#         )
#         return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
@permission_classes([AllowAny])
def create_user_from_n8n(request):

    secret_token = request.headers.get('X-N8N-TOKEN')
    if secret_token != 'my-super-secret-token-123':
        return Response({'error': 'Unauthorized'}, status=401)

    data = request.data
    username = data.get('user')
    password = data.get('password')

    if not username or not password:
        return Response({'error': 'Username and Password required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )

        UserProfile.objects.create(
            user=user,
            user_type=data.get('user_type', 'resident'),
            phone_number=data.get('phone_number', ''),
            raw_password=password,
            house_number=data.get('house_number'),
            address=data.get('address')
        )

        return Response({'message': 'User created successfully'}, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- 4. API สำหรับ Login ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    # รับค่า username และ password จาก Frontend
    username = request.data.get('username') 
    password = request.data.get('password')

    try:
        # 1. ค้นหาผู้ใช้ด้วย username (Django บังคับให้ Unique อยู่แล้ว จึงหาเจอเร็วมาก)
        user_obj = User.objects.get(username=username)
        
        # 2. ตรวจสอบรหัสผ่าน
        if user_obj.check_password(password):
            # ดึงโปรไฟล์เพื่อดูบทบาท (Role)
            try:
                profile = UserProfile.objects.get(user=user_obj)
                role = profile.user_type
            except UserProfile.DoesNotExist:
                role = 'resident'

            return Response({
                "status": "success",
                "user": {
                    "id": user_obj.id,
                    "name": f"{user_obj.first_name} {user_obj.last_name}".strip(),
                    "email": user_obj.email,
                    "username": user_obj.username,
                    "role": role
                }
            })
        else:
            return Response({"status": "error", "message": "รหัสผ่านไม่ถูกต้อง"}, status=400)
            
    except User.DoesNotExist:
        return Response({"status": "error", "message": "ไม่พบ Username นี้ในระบบ"}, status=404)
    
# --- 5. API สำหรับ Logout ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def logout_view(request):
    try:
        # เคลียร์ session ของผู้ใช้ฝั่งหลังบ้าน
        logout(request) 
        return Response({
            "status": "success", 
            "message": "Logged out successfully"
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "status": "error", 
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)