from django.urls import path
from .views import AuditReportPDFView
from django.urls import path

app_name = "audit"

urlpatterns = [
    path("kpis/", DashboardKPIView.as_view(), name="dashboard-kpis"),
]
urlpatterns = [
    path('<int:file_id>/report/pdf/', AuditReportPDFView.as_view(), name='audit-report-pdf'),
]
