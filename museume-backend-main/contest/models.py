from django.utils.translation import gettext_lazy as _
from django.db import models
from member.models import Organization, Member
from work.models import Work  

class Contest(models.Model):
    AWARD_CONDITION_CHOICES = [
        ('likes', 'No. of likes'),
        ('admin', 'To be decided by admin'),
    ]
    organization = models.ForeignKey(Organization, related_name='contests', on_delete=models.CASCADE, verbose_name=_("organization"))
    name = models.CharField(max_length=255, verbose_name=_("name"))
    explanation = models.TextField(verbose_name=_("explanation"))
    start_date = models.DateTimeField(verbose_name=_("start date"))
    end_date = models.DateTimeField(verbose_name=_("end date"))
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True, verbose_name=_("thumbnail"))
    is_private = models.BooleanField(default=False, help_text=_("Private contest (visible only to organization members)"), verbose_name=_("is private"))
    award_condition = models.CharField(
        max_length=10,
        choices=AWARD_CONDITION_CHOICES,
        default='admin',
        help_text=_("Condition for awarding the contest winner"),
        verbose_name=_("condition")
    )
    winner = models.ForeignKey(
        Work,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="winning_contests",
        help_text=_("Winning work of the contest"),
        verbose_name=_("winner")
    )
    eligibility_criteria = models.TextField(blank=True, help_text=_("Eligibility criteria for participants"), verbose_name=_("eligible criteria"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Contest")
        verbose_name_plural = _("Contests")
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
    
    def determine_winner_by_likes(self):
        """
        Automatically select the winner based on the work with the most likes.
        """
        from django.db.models import Max
        max_likes_work = self.applications.aggregate(max_likes=Max('work__likes'))
        if max_likes_work['max_likes']:
            self.winner = self.applications.filter(work__likes=max_likes_work['max_likes']).first().work
            self.save()
            

class ContestApplication(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='applications', verbose_name=_("member"))
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='applications', verbose_name=_("contest"))
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='applications', verbose_name=_("work"))
    submission_date = models.DateTimeField(auto_now_add=True, verbose_name=_("submission date"))
    description = models.TextField(blank=True, null=True, verbose_name=_("description"))

    class Meta:
        unique_together = ('contest', 'work') 
        verbose_name = _("Application")
        verbose_name_plural = _("Applications")

    def __str__(self):
        return f"{self.work.title} applied to {self.contest.name} by {self.member.username}"
