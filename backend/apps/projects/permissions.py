from apps.accounts.permissions import RoleBasedModelPermissions

OWNER_BYPASS_METHODS = ('GET', 'PUT', 'PATCH')


class ProjectPermission(RoleBasedModelPermissions):
    """RoleBasedModelPermissions, but a project's owner may also view and
    edit that specific project (GET/PUT/PATCH on the detail endpoint) even
    without the underlying view_project/change_project permission. Listing
    every project still requires view_project.
    """

    def has_permission(self, request, view):
        if request.method in OWNER_BYPASS_METHODS and view.action != 'list':
            return bool(request.user and request.user.is_authenticated)
        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        if request.method in OWNER_BYPASS_METHODS and obj.owner_id == request.user.id:
            return True
        return super().has_permission(request, view)
