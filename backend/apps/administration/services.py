from .models import ActivityLog


def log_activity(actor, action, description='', ip_address=None):
    return ActivityLog.objects.create(
        actor=actor, action=action, description=description, ip_address=ip_address,
    )


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
