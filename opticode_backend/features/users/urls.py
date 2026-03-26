from django.urls import path

from features.users.views import SuspendUserView, UserListView

app_name = "users"

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("<int:pk>/suspend/", SuspendUserView.as_view(), name="user-suspend"),
]