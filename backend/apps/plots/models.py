from django.db import models

from apps.core.models import BaseModel
from apps.projects.models import Project


class Plot(BaseModel):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        RESERVED = 'reserved', 'Reserved'
        SOLD = 'sold', 'Sold'
        TRANSFERRED = 'transferred', 'Transferred'
        CANCELLED = 'cancelled', 'Cancelled'

    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name='plots')
    plot_number = models.CharField(max_length=50)
    block = models.CharField(max_length=100, blank=True)
    street = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    # Area
    area_sqm = models.DecimalField(max_digits=14, decimal_places=2)

    # Financials — TZS. Writable only by roles granted `set_plot_financials`
    # (Administrator, Managing Director, Finance Manager, Sales Manager);
    # enforced in the serializer, not here.
    price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    polygon_geojson = models.JSONField(default=dict, blank=True)
    corner_coordinates = models.JSONField(default=list, blank=True)
    google_maps_url = models.URLField(blank=True)
    nearby_schools = models.JSONField(default=list, blank=True)
    nearby_roads = models.JSONField(default=list, blank=True)
    nearby_hospitals = models.JSONField(default=list, blank=True)

    # Media
    image_urls = models.JSONField(default=list, blank=True)
    images_360_urls = models.JSONField(default=list, blank=True)

    # Ownership — Customer module (spec Module 5) hasn't landed yet, so this
    # is a plain name for now and will become an FK once Customers exist.
    current_owner = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['project', 'plot_number'], name='unique_plot_number_per_project'),
        ]
        permissions = [
            ('set_plot_financials', 'Can set plot price and discount'),
        ]

    def __str__(self):
        return f'{self.project.name} - {self.plot_number}'

    @property
    def final_price(self):
        return self.price - self.discount
