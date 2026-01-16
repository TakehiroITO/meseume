from django.utils.translation import gettext_lazy as _
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse
from django.db.models import Q
from django import forms
from django.core.exceptions import ValidationError
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password
from member.helpers.emails import send_email
from member.helpers.sendgrid import create_new_sender_idenity
from .models import *
from contest.models import Contest
from work.models import Work
from member.helpers.permissions import assign_permissions
from django.contrib.auth.models import Group
from django.contrib.admin import SimpleListFilter
from django.shortcuts import render, redirect
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME
from .forms import CustomEmailForm
from django.conf import settings

admin.site.unregister(Group)

admin.site.site_header = _("Museume Administration")
admin.site.index_title = _("Welcome to Your Admin Panel")

# Organization Form
class OrganizationForm(forms.ModelForm):
    class Meta:
        model = Organization
        fields = '__all__'

    def save(self, commit=True):
        organization = super().save(commit=False)
        is_new = organization.pk is None  # Check if this is a new organization
        if commit:
            organization.save()
            if is_new:
                # Create company_admin only for new organizations
                password = "Aqwsaqws"
                if not Member.objects.filter(email=organization.email).exists():
                    user = Member.objects.create_user(
                        username=organization.email,
                        email=organization.email,
                        first_name=organization.staff_name,
                        password=password,
                        role='company_admin' if organization.parent is None else 'branch_admin',
                        is_staff=True,
                        organization=organization,
                    )
                    user.password = make_password(password)
                    user.save()
                    assign_permissions(user, ['view', 'change'], StaffMember)
                    assign_permissions(user, ['view', 'change'], ProfileMember)
                    assign_permissions(user, ['view', 'change'], Organization)
                    assign_permissions(user, ['view', 'change'], Contest)
                    assign_permissions(user, ['view', 'change'], Work)

                    #make new organization email address
                    sender_identity = {
                        "username": organization.username,
                        "address": organization.address,
                        "city": organization.city,
                        "country": organization.country,
                        "name": organization.name,
                        "email": organization.email,
                    }
                    organization.custom_email_address = create_new_sender_idenity(sender_identity)
                    organization.save()

                    # Send email
                    context = {
                        'user_name': organization.staff_name,
                        'organization_name': organization.name,
                        'email': organization.email,
                        'password': password,
                    }
                    send_email(
                        template_name='emails/organization_created.html',
                        subject=f"Welcome to {organization.name} – Organization Created",
                        context=context,
                        recipient_email=organization.email,
                    )
                else:
                    raise ValidationError("Admin email already exists. Admin creation aborted.")
        return organization


# Organization Admin
@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    form = OrganizationForm
    list_display = ('name', 'email', 'parent')

    def get_form(self, request, obj=None, **kwargs):
        """
        Dynamically make `parent` required if the user is not a superuser.
        """
        form = super().get_form(request, obj=obj, **kwargs)

        if not request.user.is_superuser and not obj:
            # Force the `parent` field to be required
            form.base_fields['parent'].required = True
        
        return form

    def save_model(self, request, obj, form, change):
        form.save(commit=True)
        
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.role == 'company_admin':
            return request.user.organization.get_nested_branches()
        if request.user.role == 'branch_admin':
            return request.user.organization.get_nested_branches()
        return qs.none()

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return ['organization_code', 'custom_email_address']  # Superusers have no readonly fields
        elif request.user.role in ['company_admin', 'branch_admin']:
            if obj:
                return [field.name for field in self.model._meta.fields if field.name in ['parent', 'organization_code', 'address', 'custom_email_address', 'country', 'city']]
        return super().get_readonly_fields(request, obj)

    def has_change_permission(self, request, obj=None):
        # Allow org admin to edit only their own organization
        if request.user.role == 'company_admin':
            request.user.organization.get_nested_branches()
            if obj is None or (obj == request.user.organization or obj.parent == request.user.organization):
                return True
        return super().has_change_permission(request, obj)

    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        elif request.user.role in ['company_admin', 'branch_admin']:
            return True
        return False


    def has_delete_permission(self, request, obj=None):
        # Org admins cannot delete organizations
        if request.user.role == 'company_admin':
            if obj and (obj != request.user.organization):
                return True
        return super().has_delete_permission(request, obj)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "parent" and request.user.role == 'company_admin':
            kwargs["queryset"] = request.user.organization.get_nested_branches()
        if db_field.name == "parent" and request.user.role == 'branch_admin':
            kwargs["queryset"] = request.user.organization.get_nested_branches()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role in ['company_admin']:
            if obj is None or (obj == request.user.organization or obj.parent == request.user.organization):
                return True
        return False


def send_custom_message(modeladmin, request, queryset):
    """
    Admin action to send a custom email to selected RegularMember(s).
    """
    # If the user has submitted the form (clicked 'Send')
    if 'apply' in request.POST:
        form = CustomEmailForm(request.POST)
        if form.is_valid():
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']

            # Send the email to each selected member
            for member in queryset:
                if request.user.organization.custom_email_address:
                    from_email = request.user.organization.custom_email_address
                else:
                    from_email = settings.EMAIL_HOST_MAIL

                print(f"Sending email to {member.email}")
                print(f"Subject: {subject}")
                print(f"Message: {message}")
                context = {
                    "action_link": "",
                    "custom_message": message,
                    "from_email": from_email
                }

                send_email(
                    template_name='emails/custom_messages.html',
                    subject="Message Notification",
                    context=context,
                    recipient_email=member.email if member.role is not 'child' else member.parent.email,
                    from_email=from_email
                )

            messages.success(request, "Custom emails sent successfully!")
            # Redirect back to the changelist page
            if member.role == 'child':
                return redirect(reverse('admin:member_profilemember_changelist'))
            elif member.role == 'company_admin' or member.role == 'branch_admin':
                return redirect(reverse('admin:member_staffmember_changelist'))
            else:
                return redirect(reverse('admin:member_regularmember_changelist'))
    else:
        # If this is the initial GET, create a form with selected IDs
        selected = request.POST.getlist(ACTION_CHECKBOX_NAME)
        form = CustomEmailForm(
            initial={'_selected_action': selected}
        )

    # Render a custom template with the form
    return render(
        request,
        'admin/send_custom_email.html',  # Template to be created
        {
            'form': form,
            'queryset': queryset,
            'action': 'send_custom_message'
        }
    )

send_custom_message.short_description = _("Send custom message to selected users")


class OrganizationFilter(SimpleListFilter):
    title = _("Organization")  # Filter title in the sidebar
    parameter_name = "organization"

    def lookups(self, request, model_admin):
        """Show only organizations the admin has access to"""
        if request.user.is_superuser:
            queryset = Organization.objects.all()
        elif request.user.role == "company_admin":
            queryset = Organization.objects.filter(id=request.user.organization.id)
        elif request.user.role == "branch_admin":
            queryset = Organization.objects.filter(id=request.user.organization.id)
        else:
            return []

        return [(org.id, org.name) for org in queryset]

    def queryset(self, request, queryset):
        """Filter the queryset based on the selected organization"""
        if self.value():
            return queryset.filter(organization_id=self.value())
        return queryset


@admin.register(StaffMember)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'organization')
    list_filter = (OrganizationFilter, )
    search_fields = ('username', 'email')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_active',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    actions = [send_custom_message]
    
    def save_model(self, request, obj, form, change):
        # Hash the password if it was changed
        if 'password' in form.changed_data:
            obj.password = make_password(obj.password)
        super().save_model(request, obj, form, change)


    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(role__in=['company_admin', 'branch_admin',])
        elif request.user.role == 'company_admin':
            return qs.filter(Q(organization=request.user.organization) | Q(organization__in=request.user.organization.branches.all())).filter(role__in=['company_admin', 'branch_admin', 'system_admin'])
        elif request.user.role == 'branch_admin':
            return qs.filter(organization=request.user.organization, role__in=['branch_admin'])
        return qs.none()

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'company_admin':
            if obj is None or obj.organization == request.user.organization or obj.organization in request.user.organization.branches.all():
                return True
        elif request.user.role == 'branch_admin':
            if obj is None or obj.organization == request.user.organization:
                return True
        return False

    def has_change_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_add_permission(self, request):
        return request.user.is_superuser


@admin.register(RegularMember)
class RegularMemberAdmin(admin.ModelAdmin):
    list_display = ('email', 'organization')
    search_fields = ('email',)
    actions = [send_custom_message]
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('address',)}),
        ('Permissions', {'fields': ('is_active',)}),
    )

    def save_model(self, request, obj, form, change):
        # Hash the password if it was changed
        if 'password' in form.changed_data:
            obj.password = make_password(obj.password)
        if 'email' in form.changed_data:
            obj.username = obj.email
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(role='protector')
        elif request.user.role == 'company_admin':
            return qs.filter(organization=request.user.organization, role='protector')
        return qs.none()

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_add_permission(self, request):
        return request.user.is_superuser


class ProfileMemberOrganizationFilter(SimpleListFilter):
    title = _("Organizations")
    parameter_name = "organization"

    def lookups(self, request, model_admin):
        """Show only for superusers, listing all organizations."""
        if request.user.is_superuser:
            queryset = Organization.objects.all()
            return [(org.id, org.name) for org in queryset]
        return []

    def queryset(self, request, queryset):
        """Filter ProfileMembers who are associated with the selected organization(s)."""
        if request.user.is_superuser and self.value():
            return queryset.filter(organizations__id=self.value()).distinct()
        return queryset


@admin.register(ProfileMember)
class ProfileMemberAdmin(admin.ModelAdmin):
    list_display = ('username', 'organization')
    search_fields = ('username',)

    fieldsets = (
        (None, {'fields': ('username', 'parent')}),
        ('Personal info', {'fields': ('date_of_birth',)}),
    )
    
    def get_list_filter(self, request):
        """Dynamically add organization filter only for superusers."""
        filters = list(self.list_filter)  # Copy default filters
        if request.user.is_superuser:
            filters.append(ProfileMemberOrganizationFilter)  # Add custom organization filter
        return filters

    def remove_from_org(self, request, queryset):
        """
        Remove the selected ProfileMembers from the current admin's organization.
        """
        # Safety check: only proceed if request.user has an organization
        if not request.user.organization:
            self.message_user(request, "You do not belong to any organization.", level=messages.ERROR)
            return

        removed_count = 0
        for profile_member in queryset:
            # Make sure the profile is in the user's organization set
            if request.user.organization in profile_member.organizations.all():
                profile_member.organizations.remove(request.user.organization)
                removed_count += 1

        self.message_user(request, f"{removed_count} profile(s) removed from {request.user.organization.name}.")

    remove_from_org.short_description = _("Remove selected profiles from my organization")

    actions = [remove_from_org, send_custom_message]
    def get_actions(self, request):
        """
        Return available actions. Remove 'remove_from_org' if the user is a superuser
        or does not have a company/branch admin role.
        """
        actions = super().get_actions(request)

        # If superuser or other role, remove the action
        if request.user.is_superuser or request.user.role not in ['company_admin', 'branch_admin']:
            if 'remove_from_org' in actions:
                del actions['remove_from_org']

        return actions
    
    def get_readonly_fields(self, request, obj=None):
        if request.user.role in ['company_admin', 'branch_admin']:
            if obj:
                return [field.name for field in self.model._meta.fields if field.name in ['parent']]
        return super().get_readonly_fields(request, obj)


    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(role='child')
        else:
            return request.user.organization.get_children()
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "parent" and request.user.is_superuser:
            kwargs["queryset"] = RegularMember.objects.filter(role='protector')
        if db_field.name == "parent" and request.user.role == 'company_admin':
            kwargs["queryset"] = RegularMember.objects.filter(role='protector')
        if db_field.name == "parent" and request.user.role == 'branch_admin':
            kwargs["queryset"] = RegularMember.objects.filter(role='protector')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'company_admin':
            if obj is None or request.user.organization.get_children().filter(id=obj.id):
                return True
        return True

    def has_change_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_add_permission(self, request):
        return False
