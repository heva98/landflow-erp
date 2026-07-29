from django.db import models

from apps.core.models import BaseModel


class Project(BaseModel):
    class Status(models.TextChoices):
        PLANNING = 'planning', 'Planning'
        DEVELOPMENT = 'development', 'Development'
        SELLING = 'selling', 'Selling'
        COMPLETED = 'completed', 'Completed'

    name = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    description = models.TextField(blank=True)

    # Location
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Master plan and media (S3-backed document management lands in a later
    # module; for now these hold URLs to already-uploaded files).
    master_plan_url = models.URLField(blank=True)
    map_url = models.URLField(blank=True)
    image_urls = models.JSONField(default=list, blank=True)
    video_urls = models.JSONField(default=list, blank=True)
    nearby_services = models.JSONField(default=list, blank=True)

    # Area
    total_area_sqm = models.DecimalField(max_digits=14, decimal_places=2)

    # Financials — TZS
    acquisition_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    development_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    expected_revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    # Timeline
    start_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('view_project_financials', 'Can view project financial figures (expected revenue, ROI)'),
        ]

    def __str__(self):
        return self.name

    @property
    def total_cost(self):
        return self.acquisition_cost + self.development_cost

    @property
    def roi_percent(self):
        cost = self.total_cost
        if not cost:
            return None
        return (self.expected_revenue - cost) / cost * 100
