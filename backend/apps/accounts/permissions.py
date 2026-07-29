from rest_framework.permissions import DjangoModelPermissions


class RoleBasedModelPermissions(DjangoModelPermissions):
    """DjangoModelPermissions, but GET/HEAD/OPTIONS also require view_<model>."""

    def __init__(self):
        self.perms_map = {
            **self.perms_map,
            'GET': ['%(app_label)s.view_%(model_name)s'],
            'OPTIONS': ['%(app_label)s.view_%(model_name)s'],
            'HEAD': ['%(app_label)s.view_%(model_name)s'],
        }
