from django.db.models import Max
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import DocumentFilter, DocumentVersionFilter
from .models import Document, DocumentVersion
from .serializers import DocumentSerializer, DocumentVersionSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related(
        'content_type', 'uploaded_by', 'current_version',
    ).prefetch_related('versions').all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DocumentFilter
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['title', 'created_at', 'updated_at']

    @action(detail=True, methods=['post'])
    def upload_version(self, request, pk=None):
        document = self.get_object()
        file = request.data.get('file')
        if not file:
            return Response({'file': 'A file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        next_version = (document.versions.aggregate(Max('version_number'))['version_number__max'] or 0) + 1
        version = DocumentVersion.objects.create(
            document=document, version_number=next_version, file=file,
            uploaded_by=request.user, notes=request.data.get('notes', ''),
        )
        document.current_version = version
        document.save(update_fields=['current_version', 'updated_at'])
        return Response(self.get_serializer(document).data, status=status.HTTP_201_CREATED)


class DocumentVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only — versions are created via Document.upload_version, never directly."""

    queryset = DocumentVersion.objects.select_related('document', 'uploaded_by').all()
    serializer_class = DocumentVersionSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = DocumentVersionFilter
    ordering_fields = ['version_number', 'created_at']
