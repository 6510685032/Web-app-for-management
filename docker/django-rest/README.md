The default superuser will be created when the container is built.
- Username: admin
- Password: admin
- Email: admin@admin.com

media/maintenance_requests will not be used since we are using S3 for storage.
staticfiles and statics will be created by default due to how Django and tailwindCSS works