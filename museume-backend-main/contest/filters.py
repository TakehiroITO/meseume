import django_filters
from .models import Contest
from django.utils import timezone
from django.db.models import Q

class ContestFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(
        choices=[('all', 'All'), ('already_held', 'Already_Held'), ('in_session', 'In_Session'), ('scheduled', 'Scheduled'), ('already_participated', 'Already_Participated')],
        method='filter_contests'
    )
    search = django_filters.CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Contest
        fields = ['status', 'search']

    def filter_contests(self, queryset, name, value):
        """
        Custom filtering logic for contest status based on the `filter` query parameter.
        """
        today = timezone.now().date()
        user = self.request.user

        if value == 'all' or value is None:
            return queryset
        elif value == 'already_held':
            return queryset.filter(Q(end_date__lt=today) | ~Q(winner=None))
        elif value == 'in_session':
            return queryset.filter(start_date__lte=today, end_date__gte=today)
        elif value == 'scheduled':
            return queryset.filter(start_date__gt=today)
        # elif value == 'already_participated':
        #     return queryset.filter(participants__in=[user])
        return queryset
