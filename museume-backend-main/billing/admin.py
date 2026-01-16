from django.contrib import admin
from .models import Plan, Subscription

# Register your models here.

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'currency', 'interval', 'stripe_price_id')
    fields = ('name', 'amount', 'currency', 'interval', 'features')

admin.site.register(Subscription)
