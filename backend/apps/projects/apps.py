from django.apps import AppConfig


class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.projects'
    label = 'projects'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Project

        register_for_audit(Project)
