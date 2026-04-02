import io
import logging

from django.db.models import Avg, Count, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from features.projects.models import Project
from features.audit.models import AuditResult, Finding, UploadedFile
from features.audit.serializers import AuditResultSerializer

# Inicialización de utilidades globales del módulo
logger = logging.getLogger(__name__)
CRITICAL_SCORE_THRESHOLD = 50


class DashboardKPIView(APIView):
    """
    Endpoint para proveer KPIs al Dashboard.
    GET /api/audit/kpis/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # 1. Total de proyectos
        total_projects = Project.objects.filter(owner=user).count()

        # 2 y 3. Promedio de scores y archivos con score < CRITICAL_SCORE_THRESHOLD
        file_metrics = UploadedFile.objects.filter(project__owner=user).aggregate(
            avg_score=Avg('score'),
            files_under_threshold=Count('id', filter=Q(score__lt=CRITICAL_SCORE_THRESHOLD))
        )
        avg_score = file_metrics['avg_score']
        files_under_50 = file_metrics['files_under_threshold']

        # 4. Distribución de severidades (error vs warning)
        severity_dist = Finding.objects.filter(
            audit_result__uploaded_file__project__owner=user
        ).values('severity').annotate(count=Count('id'))

        distribution = {
            Finding.Severity.ERROR: 0,
            Finding.Severity.WARNING: 0
        }
        for item in severity_dist:
            sev = item['severity']
            if sev in distribution:
                distribution[sev] = item['count']

        return Response({
            "total_projects": total_projects,
            "average_score": round(avg_score, 2) if avg_score is not None else 0,
            "files_under_50": files_under_50,
            "severity_distribution": distribution
        })


class AuditReportPDFView(APIView):
    """
    Endpoint: GET /api/audit/<file_id>/report/pdf/
    Generates a PDF report using WeasyPrint based on the file ID.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        # 1. Autorización (IDOR): Verificar que el archivo existe y es propiedad del usuario
        uploaded_file = get_object_or_404(UploadedFile, id=file_id, project__owner=request.user)

        try:
            # 2. Prevención de Inyección: Utilizar render_to_string
            context = {
                'file_id': file_id,
                'user_email': request.user.email if hasattr(request.user, 'email') else 'Unknown'
            }
            html_content = render_to_string('pdf/audit_report.html', context)

            from weasyprint import HTML

            pdf_bytes = HTML(string=html_content).write_pdf()

            # Wrap in buffer and return as FileResponse
            buffer = io.BytesIO(pdf_bytes)
            buffer.seek(0)

            filename = f"audit_report_{file_id}.pdf"
            response = FileResponse(
                buffer, 
                as_attachment=True, 
                filename=filename, 
                content_type='application/pdf'
            )
            return response
        except Exception as e:
            logger.error(f"Error generando PDF para archivo {file_id}: {e}", exc_info=True)
            return Response(
                {"detail": "Error interno al generar el reporte PDF."},
                status=500
            )


class AuditReportView(APIView):
    """
    Endpoint: GET /api/audit/<file_id>/report/
    Retorna el reporte de auditoría serializado con hallazgos.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        uploaded_file = get_object_or_404(
            UploadedFile,
            id=file_id,
            project__owner=request.user,
        )

        audit_result = get_object_or_404(AuditResult, uploaded_file=uploaded_file)
        serializer = AuditResultSerializer(audit_result)
        return Response(serializer.data)