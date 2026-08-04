from django.apps import AppConfig


class SurveysConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.surveys'
    label = 'surveys'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import (
            Beacon, RoadReserve, Subdivision, SubdivisionPlot, Survey, SurveyCompany,
            SurveyDocument, Surveyor, UtilityReserve,
        )

        register_for_audit(SurveyCompany)
        register_for_audit(Surveyor)
        register_for_audit(Survey)
        register_for_audit(Beacon)
        register_for_audit(Subdivision)
        register_for_audit(SubdivisionPlot)
        register_for_audit(RoadReserve)
        register_for_audit(UtilityReserve)
        register_for_audit(SurveyDocument)
