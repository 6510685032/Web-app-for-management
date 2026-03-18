from rest_framework.permissions import BasePermission

class HasRole(BasePermission):
    """ คลาสหลักสำหรับเช็ค Role """
    allowed_roles = []

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'profile')):
            return False
        return request.user.profile.user_type in self.allowed_roles

# สร้าง Permission ย่อยให้เอาไปใช้ต่อได้ง่ายๆ
class IsAdmin(HasRole): allowed_roles = ['admin']
class IsOfficer(HasRole): allowed_roles = ['officer']
class IsTechnician(HasRole): allowed_roles = ['technician']
class IsResident(HasRole): allowed_roles = ['resident']

# แบบผสม (อนุญาตให้นิติและแอดมินเข้าถึงได้)
class IsOfficerOrAdmin(HasRole): allowed_roles = ['officer', 'admin']