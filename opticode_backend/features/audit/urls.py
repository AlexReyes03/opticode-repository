from django.urls import path
from .views import AuditReportPDFView

app_name = "audit"

urlpatterns = [
    path('<str:fileId>/report/pdf/', AuditReportPDFView.as_view(), name='audit-report-pdf'),
]
