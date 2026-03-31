from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count

from features.projects.models import Project
from features.audit.models import UploadedFile, Finding

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

        # 2. Promedio de scores
        avg_score_agg = UploadedFile.objects.filter(project__owner=user).aggregate(avg_score=Avg('score'))
        avg_score = avg_score_agg['avg_score']

        # 3. Archivos con score < 50
        files_under_50 = UploadedFile.objects.filter(project__owner=user, score__lt=50).count()

        # 4. Distribución de severidades (error vs warning)
        severity_dist = Finding.objects.filter(
            audit_result__uploaded_file__project__owner=user
        ).values('severity').annotate(count=Count('id'))

        distribution = {
            'error': 0,
            'warning': 0
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