from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django.contrib import admin
from .models import Work, Tag, Category, Image
from django.contrib.admin import SimpleListFilter
from member.models import Organization, Member
from django.contrib import messages
from django.utils.html import format_html
from member.models import RegularMember
from work.forms import WorkForm

class ImageInline(admin.TabularInline):
    model = Image
    fields = ('image','created_at')
    readonly_fields = ('image', 'created_at')  # Make all fields read-only
    can_delete = False  # Disable deletion
    extra = 0  # No empty forms for adding new images
    show_change_link = True  # Add a link to view image details

    def has_add_permission(self, request, obj=None):
        return False  # Disable adding new images inline

class OrganizationFilter(SimpleListFilter):
    title = 'Organization'
    parameter_name = 'organization'

    def lookups(self, request, model_admin):
        organizations = Organization.objects.all()
        return [(org.id, org.name) for org in organizations]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(member__organization_id=self.value())
        return queryset

@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'member',
        'is_public',
        'is_approved',
        'category',
        'display_images',  # <-- Add our custom display
        'created_at',
    )
    list_filter = (OrganizationFilter, 'is_approved')
    search_fields = ('title', 'member__username', 'category__name')
    ordering = ('created_at',)
    actions = ['approve_selected_works']
    inlines = [ImageInline]

    def get_form(self, request, obj=None, **kwargs):
        """Use WorkForm only for adding new Work instances."""
        if obj is None:  # If adding a new object
            kwargs['form'] = WorkForm
            form = super().get_form(request, obj=obj, **kwargs)
            form.request = request
            return form
        return super().get_form(request, obj, **kwargs)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Default to unapproved works
        # if not request.GET.get('is_approved'):
        #     qs = qs.filter(is_approved=True)
        if request.user.is_superuser:
            return qs
        elif request.user.role == 'company_admin':
            organizations = Organization.objects.filter(Q(id=request.user.organization_id) | Q(parent=request.user.organization))
            members = RegularMember.objects.filter(Q(organizations__in=organizations))
            return qs.filter(member__in=members)
        elif request.user.role == 'branch_admin':
            organizations = Organization.objects.filter(Q(id=request.user.organization_id))
            members = RegularMember.objects.filter(Q(organizations__in=organizations))
            return qs.filter(member__in=members)
        return qs

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "member" and request.user.role == 'company_admin':
            kwargs["queryset"] = request.user.organization.get_children()
        if db_field.name == "member" and request.user.role == 'branch_admin':
            kwargs["queryset"] = request.user.organization.get_children()
        if db_field.name == "member" and request.user.is_superuser:
            kwargs["queryset"] = Member.objects.filter(role='child')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    @admin.action(description=_("Approve selected works"))
    def approve_selected_works(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(
            request,
            _("Work(s) have been successfully approved."),
            level=messages.SUCCESS
        )

    def display_images(self, obj):
        """Show all related images as thumbnails that open in a new tab."""
        images_html = ""
        for image in obj.images.all():
            if image.image:
                images_html += format_html(
                    '<a href="{url}" target="_blank">'
                    '<img src="{url}" style="max-height: 50px; margin-right: 5px;"/>'
                    '</a>',
                    url=image.image.url
                )
        return format_html(images_html) if images_html else _("No images")

    display_images.short_description = _("Images")
    
    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_add_permission(self, request):
        return True

    # def has_view_permission(self, request):
    #     return True

admin.site.register(Category)
# admin.site.register(Tag)
