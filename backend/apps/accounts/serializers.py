from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Role, User


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'full_access', 'read_only_all', 'permissions']
        read_only_fields = fields

    def get_permissions(self, obj):
        if obj.full_access:
            return ['*']
        return sorted(
            f'{p.content_type.app_label}.{p.codename}'
            for p in obj.permissions.select_related('content_type').all()
        )


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True, required=False, allow_null=True,
    )
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'role_id', 'password',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return user


class MeSerializer(UserSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['permissions']

    def get_permissions(self, obj):
        return obj.get_permission_codes()


class ActivityLoggingTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Records a login/login-failed entry to the activity log around the
    standard JWT obtain flow, without changing its response shape."""

    def validate(self, attrs):
        from apps.administration.services import log_activity

        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            log_activity(
                actor=None, action='login_failed',
                description=f'Failed login attempt for {attrs.get(self.username_field, "")}',
            )
            raise
        log_activity(actor=self.user, action='login', description=self.user.email)
        return data
