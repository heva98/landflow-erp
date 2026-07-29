from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import Permission, PermissionsMixin
from django.db import models

from apps.core.models import BaseModel


class Role(BaseModel):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    full_access = models.BooleanField(
        default=False,
        help_text='Bypasses all permission checks entirely (e.g. Administrator).',
    )
    read_only_all = models.BooleanField(
        default=False,
        help_text='Implicit view-only access to every model, present or future (e.g. Auditor).',
    )
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.ForeignKey(
        Role, null=True, blank=True, on_delete=models.SET_NULL, related_name='users',
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ['email']

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.email

    def get_short_name(self):
        return self.first_name or self.email

    def has_perm(self, perm, obj=None):
        if self.is_active and self.is_superuser:
            return True
        if self.is_active and self.role_id:
            if self.role.full_access:
                return True
            app_label, codename = perm.split('.', 1)
            if self.role.read_only_all and codename.startswith('view_'):
                return True
            if self.role.permissions.filter(content_type__app_label=app_label, codename=codename).exists():
                return True
        return super().has_perm(perm, obj)

    def has_module_perms(self, app_label):
        if self.is_active and self.is_superuser:
            return True
        if self.is_active and self.role_id:
            if self.role.full_access or self.role.read_only_all:
                return True
            if self.role.permissions.filter(content_type__app_label=app_label).exists():
                return True
        return super().has_module_perms(app_label)

    def get_permission_codes(self):
        if self.is_superuser or (self.role_id and self.role.full_access):
            return ['*']
        if self.role_id and self.role.read_only_all:
            view_perms = Permission.objects.filter(codename__startswith='view_').select_related('content_type')
            return sorted(f'{p.content_type.app_label}.{p.codename}' for p in view_perms)
        if self.role_id:
            role_perms = self.role.permissions.select_related('content_type').all()
            return sorted(f'{p.content_type.app_label}.{p.codename}' for p in role_perms)
        return []
