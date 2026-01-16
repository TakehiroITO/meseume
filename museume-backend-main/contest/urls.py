from django.urls import path
from .views import ContestListView, ContestDetailView, SubmitWorkToContestView, MyContestsView

urlpatterns = [
    path('', ContestListView.as_view(), name='contest-list'),
    path('<int:contest_id>/', ContestDetailView.as_view(), name='contest-entry-history'),
    path('submit-work/', SubmitWorkToContestView.as_view(), name='submit-work'),
    path('my-contests/', MyContestsView.as_view(), name='my-contests'),
]
