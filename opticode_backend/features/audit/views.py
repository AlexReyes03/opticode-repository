from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q

from features.projects.models import Project
from features.audit.models import UploadedFile, Finding

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