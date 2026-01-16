from django.contrib import admin
from .models import Contest, ContestApplication
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import now
from member.models import Organization
from django.db.models import Q
from django.urls import path
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from django.utils.html import format_html
from django.urls import reverse


class ContestApplicationInline(admin.TabularInline):
    model = ContestApplication
    extra = 0  # do not display empty extra rows

    # Limit which fields appear in the inline
    readonly_fields = (
        'member_username',
        'work_link',
        'work_images',
        'description',
        'mark_as_winner_button',
    )
    fields = (
        'member_username',
        'work_link',
        'work_images',
        'description',
        'mark_as_winner_button',
    )

    def member_username(self, obj):
        if not obj or not obj.pk:
            return '-'
        # Assuming your Member model either has a username field directly 
        # or references a User model with a username field
        return obj.member.username  # or obj.member.user.username, etc.

    member_username.short_description = _("Member")

    def work_link(self, obj):
        """
        Provide a clickable link to edit the associated Work in admin.
        """
        if obj.work_id:
            url = reverse("admin:work_work_change", args=[obj.work_id])
            return format_html('<a href="{}" target="_blank">{}</a>', url, obj.work.title)
        return "-"

    work_link.short_description = _("Work")
    
    def work_images(self, obj):
        """
        Show thumbnails of the images attached to this Work with an improved modal preview.
        """
        if not obj.work_id:
            return "-"
        images = obj.work.images.all()
        if not images.exists():
            return "No images"
        
        # Create thumbnails with click handlers
        thumbs = []
        for i, image in enumerate(images):
            if image.image:
                # Add the thumbnail with click handler
                thumbs.append(format_html(
                    '<img src="{0}" style="width: 80px; height: auto; margin: 2px; cursor: pointer;" '
                    'onclick="showImageModal(\'{0}\', \'{1}\');" />',
                    image.image.url,
                    obj.member.username
                ))
        
        # Create modal HTML and JavaScript function with improved layout
        modal_html = format_html(
            """
            <div id="imageModal" style="display:none; position:fixed; z-index:9999; left:0; top:0; 
                                 width:100%; height:100%; background-color:rgba(0,0,0,0.9); overflow:auto;
                                 flex-direction:column; align-items:center; justify-content:center;">
                <span style="position:absolute; top:15px; right:35px; color:white; font-size:40px; 
                           font-weight:bold; cursor:pointer;" onclick="document.getElementById('imageModal').style.display='none';">&times;</span>
                
                <div id="modalCaption" style="color:white; padding:10px; margin-bottom:15px; font-size:18px; text-align:center;"></div>
                
                <div style="display:flex; justify-content:center; align-items:center; width:100%; height:80%;">
                    <img id="modalImage" style="max-width:90%; max-height:90%; object-fit:contain;">
                </div>
            </div>
            
            <script>
            function showImageModal(imageSrc, username) {{
                var modal = document.getElementById('imageModal');
                var modalImg = document.getElementById('modalImage');
                var captionText = document.getElementById('modalCaption');
                
                // Set caption first (before showing modal)
                captionText.innerHTML = "応募者名: " + username;
                
                // Load image
                modalImg.src = imageSrc;
                
                // Show modal with flex display
                modal.style.display = "flex";
                
                // Close on escape key
                document.addEventListener('keydown', function escapeHandler(e) {{
                    if (e.key === 'Escape' && modal.style.display === 'flex') {{
                        modal.style.display = 'none';
                        document.removeEventListener('keydown', escapeHandler);
                    }}
                }});
            }}
            </script>
            """
        )
        
        # Return thumbnails + modal
        return format_html("{0}{1}", format_html("".join(thumbs)), modal_html)

    work_images.short_description = _("Work Images")
    
    def mark_as_winner_button(self, obj):
        """
        Show a button/link to mark this work as the winner for the associated contest.
        """
        # Safety check: if object is unsaved or doesn't have an ID yet
        if not obj or not obj.pk:
            return '-'

        # Optionally hide the button if this contest already has a winner
        if obj.contest.winner_id == obj.work_id:
            return _('Already the winner')
        elif obj.contest.winner_id is not None:
            return _('Winner already chosen')

        # Build the URL to our custom admin view
        url = reverse(
            'admin:contest_mark_as_winner',  # We'll define this name in get_urls()
            args=[obj.contest.pk, obj.pk]
        )
        return format_html(
            '<a class="button" href="{}" style="background: #28a745; color: white; padding: 3px 8px; text-decoration: none;">'
            'Mark as Winner</a>',
            url
        )
    mark_as_winner_button.short_description = _("Action")

    # Make the inline read-only if desired (except for superuser)
    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        elif request.user.role in ['company_admin', 'branch_admin']:
            if obj and obj.organization == request.user.organization:
                return True
            return True

    def has_delete_permission(self, request, obj=None):
        return False


class ContestStatusFilter(admin.SimpleListFilter):
    """
    Custom filter for contest status (Ongoing, Past).
    """
    title = _('Contest Status')
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return [
            ('ongoing', 'Ongoing Contests'),
            ('past', 'Past Contests'),
        ]

    def queryset(self, request, queryset):
        if self.value() == 'ongoing':
            return queryset.filter(start_date__lte=now(), end_date__gte=now())
        elif self.value() == 'past':
            return queryset.filter(end_date__lt=now())
        return queryset

@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'start_date', 'end_date', 'is_private', 'award_condition', 'winner')
    list_filter = (ContestStatusFilter,)
    search_fields = ('name', 'organization__name')
    ordering = ('start_date',)
    inlines = [ContestApplicationInline]
    
    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return []  # Superusers have no readonly fields
        elif request.user.role in ['company_admin', 'branch_admin']:
            return [field.name for field in self.model._meta.fields if field.name != 'winner']
        return super().get_readonly_fields(request, obj)


    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "organization":
            if request.user.is_superuser:
                kwargs["queryset"] = Organization.objects.all()
            elif request.user.role == 'company_admin':
                kwargs["queryset"] = Organization.objects.filter(id=request.user.organization_id)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        elif request.user.role == 'company_admin':
            organizations = Organization.objects.filter(Q(id=request.user.organization_id) | Q(parent=request.user.organization))
            return qs.filter(organization__in=organizations)
        elif request.user.role == 'branch_admin':
            organizations = Organization.objects.filter(Q(id=request.user.organization_id) | Q(parent=request.user.organization))
            return qs.filter(organization__in=organizations)
        if not request.GET.get('status'):
            qs = qs.filter(start_date__lte=now(), end_date__gte=now())  # Default to ongoing contests
        return qs.none()
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj:
            # Limit the winner choices to works submitted to the contest
            form.base_fields['winner'].queryset = obj.applications.values_list('work', flat=True)
        return form

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'company_admin':
            organizations = Organization.objects.filter(Q(id=request.user.organization_id) | Q(parent=request.user.organization))
            if obj and obj.organization in organizations:
                return True
        elif request.user.role == 'branch_admin':
            if obj is None or obj.organization in organizations:
                return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'company_admin':
            organizations = Organization.objects.filter(Q(id=request.user.organization_id) | Q(parent=request.user.organization))
            if obj is None or obj.organization in organizations:
                return True
        elif request.user.role == 'branch_admin':
            if obj is None or obj.organization in organizations:
                return True
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
    
    def get_actions(self, request):
        # Remove actions for company_admin and branch_admin
        # if request.user.role in ['company_admin', 'branch_admin']:
        #     return None
        return super().get_actions(request)

    def has_add_permission(self, request):
        return request.user.is_superuser

    def get_list_filter(self, request):
        if request.user.is_superuser:
            # Superusers see all filters
            return ('organization', ContestStatusFilter)
        elif request.user.role == 'company_admin':
            return (ContestStatusFilter,)
        elif request.user.role == 'branch_admin':
            return (ContestStatusFilter,)
        return []

    def organization_name(self, obj):
        return obj.organization.name
    organization_name.admin_order_field = 'organization__name'
    organization_name.short_description = _('Company Name')

    def status(self, obj):
        if obj.start_date <= now() <= obj.end_date:
            return "Ongoing"
        elif obj.end_date < now():
            return "Past"
        else:
            return "Upcoming"
    status.short_description = 'Status'
    
    def get_urls(self):
        """
        Add a custom URL pattern for 'mark_as_winner'.
        """
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:contest_id>/mark_as_winner/<int:application_id>/',
                self.admin_site.admin_view(self.mark_as_winner),
                name='contest_mark_as_winner'
            ),
        ]
        return custom_urls + urls
    
    def mark_as_winner(self, request, contest_id, application_id):
        """
        View method that sets the 'work' of a specific ContestApplication 
        as the 'winner' of the given Contest.
        """
        contest = get_object_or_404(Contest, pk=contest_id)
        # Check permission (if desired).
        if not self.has_change_permission(request, contest):
            messages.error(request, _("You do not have permission to mark a winner."))
            return redirect('admin:contest_contest_change', contest_id)

        application = get_object_or_404(contest.applications, pk=application_id)
        
        # Set the contest's winner to the Work from this application
        contest.winner = application.work
        contest.save(update_fields=['winner'])
        
        messages.success(
            request,
            f"The work '{application.work.title}' was marked as the winner of '{contest.name}'."
        )
        # Redirect back to the Contest change page
        return redirect('admin:contest_contest_change', contest_id)

