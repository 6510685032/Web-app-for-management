from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile


# สร้าง profile อัตโนมัติเมื่อสร้าง user
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):

    if created:
        UserProfile.objects.create(user=instance)


# sync password จาก n8n
@receiver(post_save, sender=UserProfile)
def sync_password_from_n8n(sender, instance, created, **kwargs):

    if instance.raw_password:

        user = instance.user

        # ป้องกัน loop
        if not user.password.startswith("pbkdf2_"):

            user.set_password(instance.raw_password)
            user.save(update_fields=["password"])