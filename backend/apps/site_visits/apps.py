from django.apps import AppConfig


class SiteVisitsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.site_visits'
    label = 'site_visits'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Bus, Driver, FollowUp, SiteVisit, SiteVisitBooking, VisitFeedback, VisitPhoto

        register_for_audit(Driver)
        register_for_audit(Bus)
        register_for_audit(SiteVisit)
        register_for_audit(SiteVisitBooking)
        register_for_audit(VisitFeedback)
        register_for_audit(VisitPhoto)
        register_for_audit(FollowUp)
