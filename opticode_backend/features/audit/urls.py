from django.urls import path
from .views import DashboardKPIView

app_name = "audit"

urlpatterns = [
    path("kpis/", DashboardKPIView.as_view(), name="dashboard-kpis"),
]
