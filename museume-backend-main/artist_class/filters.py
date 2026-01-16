import django_filters
from .models import ArtistClass
from django.utils import timezone
from django.db.models import Q

class ArtistClassFilter(django_filters.FilterSet):
    class_type = django_filters.ChoiceFilter(
        choices=[('real_time', 'Real Time'), ('recorded', 'Recorded')],
        method='filter_class_type'
    )
    is_free = django_filters.BooleanFilter(field_name='is_free')
    search = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    
    # 新規追加: 開催状況フィルター
    status = django_filters.ChoiceFilter(
        choices=[
            ('all', 'All'),
            ('scheduled', 'Scheduled'),
            ('ongoing', 'Ongoing'),
            ('completed', 'Completed'),
        ],
        method='filter_status'
    )

    class Meta:
        model = ArtistClass
        fields = ['class_type', 'is_free', 'search', 'status']

    def filter_class_type(self, queryset, name, value):
        """
        Custom filtering logic for class type.
        """
        return queryset.filter(class_type=value)
    
    def filter_status(self, queryset, name, value):
        """
        開催状況による絞り込み
        """
        if not value or value == 'all':
            return queryset
        
        now = timezone.now()
        
        if value == 'scheduled':
            # 開催予定: start_dateが未来
            return queryset.filter(start_date__gt=now)
        elif value == 'ongoing':
            # 開催中: start_date <= now <= end_date
            return queryset.filter(
                start_date__lte=now,
                end_date__gte=now
            )
        elif value == 'completed':
            # 開催済み: end_dateが過去
            return queryset.filter(end_date__lt=now)
        
        return queryset
