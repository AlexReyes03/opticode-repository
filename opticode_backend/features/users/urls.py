from django.urls import path

from features.users.views import DeleteUserView, SuspendUserView, UserListView

app_name = "users"

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("<int:pk>/suspend/", SuspendUserView.as_view(), name="user-suspend"),
    path("<int:pk>/delete/", DeleteUserView.as_view(), name="user-delete"),
]