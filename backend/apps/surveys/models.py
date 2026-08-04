import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.projects.models import Project


def _generate_reference():
    return f'SUR-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


class SurveyCompany(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    license_number = models.CharField(max_length=100, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Survey companies'

    def __str__(self):
        return self.name


class Surveyor(BaseModel):
    company = models.ForeignKey(SurveyCompany, on_delete=models.PROTECT, related_name='surveyors')
    full_name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    # Optional link to a login account, for surveyors who use the system directly.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='surveyor_profile',
    )

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name


class Survey(BaseModel):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    reference_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='surveys')
    company = models.ForeignKey(SurveyCompany, on_delete=models.PROTECT, related_name='surveys')
    lead_surveyor = models.ForeignKey(Surveyor, on_delete=models.PROTECT, related_name='surveys_led')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)

    # Tanzania's national grid; overridable per survey if a different datum/zone is used.
    coordinate_system = models.CharField(max_length=100, default='Arc 1960 / UTM Zone 37S')
    area_surveyed_sqm = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    # Approval workflow
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='surveys_approved',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='surveys_created',
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Surveys'
        permissions = [
            ('approve_survey', 'Can approve or reject a survey'),
        ]

    def __str__(self):
        return f'{self.reference_number} - {self.project.name}'

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = _generate_reference()
        super().save(*args, **kwargs)


class Beacon(BaseModel):
    class BeaconType(models.TextChoices):
        CONCRETE_PILLAR = 'concrete_pillar', 'Concrete Pillar'
        IRON_PIN = 'iron_pin', 'Iron Pin'
        WOODEN_PEG = 'wooden_peg', 'Wooden Peg'
        OTHER = 'other', 'Other'

    class Condition(models.TextChoices):
        INTACT = 'intact', 'Intact'
        DAMAGED = 'damaged', 'Damaged'
        MISSING = 'missing', 'Missing'

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='beacons')
    beacon_number = models.CharField(max_length=50)
    beacon_type = models.CharField(max_length=20, choices=BeaconType.choices, default=BeaconType.CONCRETE_PILLAR)
    condition = models.CharField(max_length=10, choices=Condition.choices, default=Condition.INTACT)

    # GPS (WGS84) and projected (UTM) coordinates, both recorded during survey.
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    easting = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    northing = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    elevation_m = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['beacon_number']
        constraints = [
            models.UniqueConstraint(fields=['survey', 'beacon_number'], name='unique_beacon_number_per_survey'),
        ]

    def __str__(self):
        return f'{self.beacon_number} ({self.survey.reference_number})'


class Subdivision(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted for Approval'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    survey = models.OneToOneField(Survey, on_delete=models.CASCADE, related_name='subdivision')
    plan_number = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    gross_area_sqm = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    road_reserve_area_sqm = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    utility_reserve_area_sqm = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    open_space_area_sqm = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_saleable_area_sqm = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='subdivisions_approved',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Subdivision for {self.survey.reference_number}'


class SubdivisionPlot(BaseModel):
    class LandUse(models.TextChoices):
        RESIDENTIAL = 'residential', 'Residential'
        COMMERCIAL = 'commercial', 'Commercial'
        MIXED_USE = 'mixed_use', 'Mixed Use'
        OPEN_SPACE = 'open_space', 'Open Space'

    subdivision = models.ForeignKey(Subdivision, on_delete=models.CASCADE, related_name='planned_plots')
    plot_number = models.CharField(max_length=50)
    block = models.CharField(max_length=100, blank=True)
    street = models.CharField(max_length=100, blank=True)
    area_sqm = models.DecimalField(max_digits=14, decimal_places=2)
    land_use = models.CharField(max_length=20, choices=LandUse.choices, default=LandUse.RESIDENTIAL)
    corner_coordinates = models.JSONField(default=list, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Set once Plot Management (spec Module 4) creates the real Plot record
    # for this line item.
    plot = models.OneToOneField(
        'plots.Plot', null=True, blank=True, on_delete=models.SET_NULL, related_name='subdivision_plot',
    )

    class Meta:
        ordering = ['plot_number']
        constraints = [
            models.UniqueConstraint(
                fields=['subdivision', 'plot_number'], name='unique_planned_plot_number_per_subdivision',
            ),
        ]

    def __str__(self):
        return f'{self.plot_number} ({self.subdivision})'


class RoadReserve(BaseModel):
    class RoadType(models.TextChoices):
        MAIN = 'main', 'Main Road'
        SECONDARY = 'secondary', 'Secondary Road'
        ACCESS = 'access', 'Access Road'
        FOOTPATH = 'footpath', 'Footpath'

    subdivision = models.ForeignKey(Subdivision, on_delete=models.CASCADE, related_name='roads')
    name = models.CharField(max_length=100)
    road_type = models.CharField(max_length=20, choices=RoadType.choices, default=RoadType.ACCESS)
    width_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    length_m = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    area_sqm = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    path_geojson = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.subdivision})'


class UtilityReserve(BaseModel):
    class UtilityType(models.TextChoices):
        WATER = 'water', 'Water'
        ELECTRICITY = 'electricity', 'Electricity'
        SEWER = 'sewer', 'Sewer'
        STORM_DRAINAGE = 'storm_drainage', 'Storm Drainage'
        TELECOM = 'telecom', 'Telecom'
        OTHER = 'other', 'Other'

    subdivision = models.ForeignKey(Subdivision, on_delete=models.CASCADE, related_name='utilities')
    utility_type = models.CharField(max_length=20, choices=UtilityType.choices)
    description = models.CharField(max_length=255, blank=True)
    area_sqm = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    path_geojson = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['utility_type']

    def __str__(self):
        return f'{self.get_utility_type_display()} ({self.subdivision})'


class SurveyDocument(BaseModel):
    class DocumentType(models.TextChoices):
        CAD = 'cad', 'CAD File'
        GIS = 'gis', 'GIS File'
        SURVEY_MAP = 'survey_map', 'Survey Map'
        REPORT = 'report', 'Survey Report'
        OTHER = 'other', 'Other'

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.OTHER)
    file = models.FileField(upload_to='surveys/%Y/%m/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='survey_documents',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_document_type_display()} for {self.survey}'
