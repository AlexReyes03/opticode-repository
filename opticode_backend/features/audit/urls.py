from django.urls import path
from .views import AuditReportPDFView, AuditReportView, DashboardKPIView

app_name = "audit"

urlpatterns = [
    path("kpis/", DashboardKPIView.as_view(), name="dashboard-kpis"),
    path("<int:file_id>/report/", AuditReportView.as_view(), name="audit-report"),
    path('<int:file_id>/report/pdf/', AuditReportPDFView.as_view(), name='audit-report-pdf'),
]
