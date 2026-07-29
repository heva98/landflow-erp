from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    label = 'accounts'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Role, User

        register_for_audit(User)
        register_for_audit(Role)
