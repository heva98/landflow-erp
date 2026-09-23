from .models import Agent, CommissionPayment


def calculate_commission_on_sale(sender, instance, created, **kwargs):
    """
    Auto-calculates and records a commission payment when a sale is made, if
    the salesperson (Sale.sold_by) has an Agent profile with an active
    commission plan.

    Runs only on creation. Cancelling a sale later doesn't retroactively
    edit or delete the commission record — reversing a paid/approved
    commission is a deliberate action (cancel it), not an automatic
    side effect, so the history stays honest about what was actually paid.
    """
    if not created or not instance.sold_by_id:
        return

    from apps.hr.models import Employee

    try:
        agent = Employee.objects.get(user_id=instance.sold_by_id).agent_profile
    except (Employee.DoesNotExist, Agent.DoesNotExist):
        return

    if not agent.is_active or not agent.commission_plan:
        return

    amount = agent.commission_plan.calculate_commission(instance.net_price)
    if amount <= 0:
        return

    CommissionPayment.objects.get_or_create(
        sale=instance,
        defaults={'agent': agent, 'commission_plan': agent.commission_plan, 'amount': amount},
    )
