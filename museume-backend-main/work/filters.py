import django_filters
from .models import Work

class WorkFilter(django_filters.FilterSet):
    tags = django_filters.CharFilter(field_name='tags__name', lookup_expr='icontains')
    category = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')

    class Meta:
        model = Work
        fields = ['tags', 'category']
