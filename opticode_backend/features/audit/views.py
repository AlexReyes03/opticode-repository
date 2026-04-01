import io
import logging

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from weasyprint import HTML

from features.audit.models import UploadedFile

logger = logging.getLogger(__name__)

class AuditReportPDFView(APIView):
    """
    Endpoint: GET /api/audit/<fileId>/report/pdf/
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

            # Convert HTML to PDF using WeasyPrint
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