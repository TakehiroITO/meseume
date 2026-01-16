from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import ArtistClass, MemberClassSignup, Payment

class MemberClassSignupInline(admin.TabularInline):
    model = MemberClassSignup
    extra = 0
    readonly_fields = ('member', 'signed_up_at', 'status', 'reminder_sent', 'attended')
    fields = ('member', 'signed_up_at', 'status', 'reminder_sent', 'attended')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('member')

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ('member', 'amount', 'status', 'stripe_payment_intent_id', 'created_at', 'updated_at')
    fields = ('member', 'amount', 'status', 'stripe_payment_intent_id', 'created_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('member')

@admin.register(ArtistClass)
class ArtistClassAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'class_type', 'is_free', 'cost', 'currency',
        'start_date', 'end_date', 'signup_count', 'payment_count', 'created_at'
    )
    list_filter = ('class_type', 'is_free', 'currency', 'created_at')
    search_fields = ('name', 'category', 'description')
    readonly_fields = ('created_at', 'updated_at', 'signup_count', 'payment_count')
    inlines = [MemberClassSignupInline, PaymentInline]
    
    fieldsets = (
        ('基本情報', {
            'fields': ('name', 'category', 'description', 'tags')
        }),
        ('クラス設定', {
            'fields': ('class_type', 'is_free', 'cost', 'currency', 'thumbnail', 'url')
        }),
        ('スケジュール', {
            'fields': ('start_date', 'end_date')
        }),
        ('統計情報', {
            'fields': ('signup_count', 'payment_count'),
            'classes': ('collapse',)
        }),
        ('システム情報', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def signup_count(self, obj):
        count = obj.signups.filter(status='confirmed').count()
        if count > 0:
            url = reverse('admin:artist_class_memberclasssignup_changelist')
            return format_html(
                '<a href="{}?artist_class__id={}">{} 人</a>',
                url, obj.id, count
            )
        return '0 人'
    signup_count.short_description = '申込者数'
    
    def payment_count(self, obj):
        count = obj.payments.filter(status='succeeded').count()
        if count > 0:
            url = reverse('admin:artist_class_payment_changelist')
            return format_html(
                '<a href="{}?artist_class__id={}">{} 件</a>',
                url, obj.id, count
            )
        return '0 件'
    payment_count.short_description = '決済完了数'

@admin.register(MemberClassSignup)
class MemberClassSignupAdmin(admin.ModelAdmin):
    list_display = (
        'artist_class', 'member_info', 'status', 'signed_up_at', 
        'reminder_sent', 'attended'
    )
    list_filter = ('status', 'reminder_sent', 'attended', 'signed_up_at')
    search_fields = ('artist_class__name', 'member__username', 'member__email')
    readonly_fields = ('signed_up_at',)
    
    def member_info(self, obj):
        return format_html(
            '<strong>{}</strong><br/>{}',
            obj.member.username,
            obj.member.email if obj.member.email else 'No email'
        )
    member_info.short_description = 'メンバー情報'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('member', 'artist_class')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'artist_class', 'member_info', 'amount', 'status', 
        'stripe_payment_intent_id', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = (
        'artist_class__name', 'member__username', 'member__email',
        'stripe_payment_intent_id'
    )
    readonly_fields = ('stripe_payment_intent_id', 'stripe_payment_intent_secret', 'created_at', 'updated_at')
    
    def member_info(self, obj):
        return format_html(
            '<strong>{}</strong><br/>{}',
            obj.member.username,
            obj.member.email if obj.member.email else 'No email'
        )
    member_info.short_description = 'メンバー情報'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('member', 'artist_class')
