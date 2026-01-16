from django.utils.translation import gettext_lazy as _
from django.db import models
from django.conf import settings
import stripe
import os

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Create your models here.
class Plan(models.Model):
    CURRENCY_CHOICES = [
        ('USD', 'USD'),
        ('JPY', 'JPY'),
    ]

    name = models.CharField(max_length=100, verbose_name=_("name"))
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("subscription id"))
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("amount"))
    currency = models.CharField(max_length=3, default='usd', verbose_name=_("currency"))
    interval = models.CharField(max_length=10, choices=[('day', 'Day'), ('week', 'Week'), ('month', 'Month'), ('year', 'Year')], verbose_name=_("interval"))
    features = models.TextField(help_text=_("Comma-separated list of features"), verbose_name=_("features"))
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')

    STRIPE_PRODUCT_ID = os.getenv('STRIPE_PRODUCT_ID')

    class Meta:
        verbose_name = _("Plan")
        verbose_name_plural = _("Plans")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.currency == 'USD':
            unit_amount = int(self.amount * 100),  # Amount in cents
        else:
            unit_amount = int(self.amount)

        if not self.stripe_price_id:
            # Create new price
            stripe_price = stripe.Price.create(
                product=self.STRIPE_PRODUCT_ID,
                unit_amount=unit_amount,
                currency=self.currency,
                recurring={"interval": self.interval},
                nickname=self.name,
                metadata={"features": self.features},
            )
            self.stripe_price_id = stripe_price.id
        else:
            # Deactivate the old price and create a new one
            current_price = stripe.Price.retrieve(self.stripe_price_id)
            if (current_price.unit_amount != unit_amount or
                    current_price.currency != self.currency or
                    current_price.recurring["interval"] != self.interval):
                # Deactivate old price
                stripe.Price.modify(self.stripe_price_id, active=False)
                # Create new price
                stripe_price = stripe.Price.create(
                    product=self.STRIPE_PRODUCT_ID,
                    unit_amount=unit_amount,
                    currency=self.currency,
                    recurring={"interval": self.interval},
                    nickname=self.name,
                    metadata={"features": self.features},
                )
                self.stripe_price_id = stripe_price.id
            else:
                # Update the metadata and nickname if only those have changed
                stripe.Price.modify(
                    self.stripe_price_id,
                    nickname=self.name,
                    metadata={"features": self.features},
                )
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        stripe.Price.modify(self.stripe_price_id, active=False)
        super().delete(*args, **kwargs)


class Subscription(models.Model):
    member = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("member"))
    stripe_subscription_id = models.CharField(max_length=255, verbose_name=_("stripe subscription id"))
    stripe_customer_id = models.CharField(max_length=255, verbose_name=_("customer id"))
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, verbose_name=_("plan"))
    active = models.BooleanField(default=True, verbose_name=_("is active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))

    class Meta:
        verbose_name = _("Subscription")
        verbose_name_plural = _("Subscriptions")

    def __str__(self):
        return f"Subscription for {self.member.username}"
