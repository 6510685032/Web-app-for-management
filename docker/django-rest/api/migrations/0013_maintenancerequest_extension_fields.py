# Generated for extension request feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='maintenancerequest',
            name='extension_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('none', 'ไม่มีคำขอขยายเวลา'),
                    ('pending', 'รอการอนุมัติขยายเวลา'),
                    ('approved', 'อนุมัติขยายเวลาแล้ว'),
                    ('rejected', 'ไม่อนุมัติขยายเวลา'),
                ],
                default='none',
                help_text='สถานะคำขอขยายเวลาจากช่าง',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='maintenancerequest',
            name='extension_requested_days',
            field=models.IntegerField(
                blank=True,
                null=True,
                help_text='จำนวนวันที่ช่างขอขยายเวลา',
            ),
        ),
        migrations.AddField(
            model_name='maintenancerequest',
            name='extension_reason',
            field=models.TextField(
                blank=True,
                null=True,
                help_text='เหตุผลในการขอขยายเวลา',
            ),
        ),
        migrations.AddField(
            model_name='maintenancerequest',
            name='extension_requested_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='เวลาที่ช่างยื่นคำขอขยายเวลา',
            ),
        ),
    ]
