from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import ContestFilter
from .models import Contest, ContestApplication
from .serializers import ContestSerializer, ContestApplicationSerializer, SubmitWorkSerializer
from .pagination import CustomPageNumberPagination
from museum_app.permissions import IsChild
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from rest_framework.response import Response
from django.utils.translation import gettext as _

class ContestListView(generics.ListAPIView):
    # permission_classes = [IsChild]
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ContestFilter
    search_fields = ['name']
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        if self.request.user and not self.request.user.is_anonymous:
            user = self.request.user
            joined_organizations = user.organizations.all()  

            queryset = Contest.objects.filter(
                Q(organization__in=joined_organizations) | Q(is_private=False)
            )
        else:
            queryset = Contest.objects.filter(is_private=False)

        return queryset
    
class ContestDetailView(generics.RetrieveAPIView):
    # permission_classes = [IsChild]
    serializer_class = ContestSerializer

    def get_object(self):
        contest_id = self.kwargs['contest_id']
        contest = get_object_or_404(Contest, id=contest_id)
        
        member = self.request.user
        if member and not member.is_anonymous:
            member_organizations = member.organizations.all()

            if contest.is_private and not member_organizations.filter(id=contest.organization.id).exists():
                raise PermissionDenied(_("You do not have permission to view this contest."))
        else:
            if contest.is_private:
                raise PermissionDenied(_("You do not have permission to view this contest."))
        
        return contest

    def retrieve(self, request, *args, **kwargs):
        contest = self.get_object()
        serializer = self.get_serializer(contest)
        return Response(serializer.data)

class SubmitWorkToContestView(generics.CreateAPIView):
    serializer_class = SubmitWorkSerializer
    permission_classes = [IsChild]

    def perform_create(self, serializer):
        self.instance = serializer.save(member=self.request.user)
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Create a custom response
        response_data = {
            "message": _("作品がコンテストに正常に提出されました。"),
            "data": serializer.data,
        }
        return Response(response_data, status=201)

class MyContestsView(generics.ListAPIView):
    serializer_class = ContestSerializer
    permission_classes = [IsChild]
    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ContestFilter
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        applied_contests = ContestApplication.objects.filter(member=user).values_list('contest', flat=True)
        return Contest.objects.filter(id__in=applied_contests)
