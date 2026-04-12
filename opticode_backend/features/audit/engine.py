"""
Motor de persistencia de hallazgos de auditoría.

Las funciones de reglas devuelven diccionarios con clave `category` (categoría del
elemento o selector afectado). El modelo :class:`Finding` almacena ese valor en
`affected_element`.
"""

from __future__ import annotations

from typing import Any, Callable, Iterable
from django.db import transaction

from features.audit.models import AuditResult, Finding, UploadedFile
from features.audit.rules import HTML_RULES, CSS_RULES


def _normalize_severity(raw: str | None) -> str:
    """Alinea severidades de reglas con Finding.Severity (error | warning)."""
    if not raw:
        return Finding.Severity.WARNING
    s = str(raw).lower()
    if s in ("error", "critical"):
        return Finding.Severity.ERROR
    return Finding.Severity.WARNING


def _count_severities(findings: Iterable[dict[str, Any]]) -> tuple[int, int]:
    """
    Cuenta críticas (error|critical) y advertencias (warning) en la salida de reglas.

    :returns: (critical_count, warning_count)
    """
    critical = 0
    warning = 0
    for f in findings:
        if not isinstance(f, dict):
            continue
        sev = _normalize_severity(f.get("severity"))
        if sev == Finding.Severity.ERROR:
            critical += 1
        else:
            warning += 1
    return critical, warning


def _compute_score(critical_count: int, warning_count: int) -> float:
    """
    HU-3.6 scoring:
      score = 100 - 10*criticas - 5*advertencias, mínimo 0.
    """
    score = 100 - (10 * int(critical_count)) - (5 * int(warning_count))
    return float(max(0, score))


def persist_findings(audit_result: AuditResult, findings: list[dict[str, Any]]) -> list[Finding]:
    """
    Crea registros Finding ligados a un AuditResult a partir de la salida de las reglas.

    Mapeo explícito: ``affected_element = f.get('category', '')``

    :param audit_result: Reporte padre ya persistido.
    :param findings: Lista de dicts retornados por las reglas.
    :returns: Instancias creadas vía bulk_create.
    """
    if not findings:
        return []

    to_create: list[Finding] = []
    for f in findings:
        if not isinstance(f, dict):
            continue
        line = f.get("line_number", f.get("line", 1))
        try:
            line = int(line)
        except (TypeError, ValueError):
            line = 1
        line_number = max(1, line)

        to_create.append(
            Finding(
                audit_result=audit_result,
                severity=_normalize_severity(f.get("severity")),
                wcag_rule=str(f.get("wcag_rule", "") or "")[:50],
                message=str(f.get("message", f.get("description", "")) or ""),
                line_number=line_number,
                code_snippet=str(f.get("code_snippet", "") or ""),
                affected_element=str(f.get("category", "") or ""),
            )
        )

    if not to_create:
        return []

    Finding.objects.bulk_create(to_create)
    return to_create


@transaction.atomic
def run_audit(
    uploaded_file: UploadedFile,
    *,
    rules: list[Callable[[str], list[dict[str, Any]]]] | None = None,
    content: str | None = None,
) -> dict[str, Any]:
    """
    Orquestador de auditoría + scoring (HU-3.6).

    - Selecciona reglas automáticamente según uploaded_file.file_type si no se proveen.
    - Ejecuta las reglas contra `content`.
    - Calcula score = 100 − 10×críticas − 5×advertencias (mínimo 0).
    - Elimina AuditResult previo (re-auditoría) y crea uno nuevo.
    - Persiste `UploadedFile.score`.

    :returns: {
      "audit_result_id": int,
      "score": float,
      "critical_count": int,
      "warning_count": int,
    }
    """
    if rules is None:
        rules = HTML_RULES if uploaded_file.file_type == UploadedFile.FileType.HTML else CSS_RULES

    findings: list[dict[str, Any]] = []

    if rules and content is not None:
        for rule in rules:
            if not callable(rule):
                continue
            out = rule(content)
            if isinstance(out, list):
                findings.extend([f for f in out if isinstance(f, dict)])

    critical_count, warning_count = _count_severities(findings)
    score = _compute_score(critical_count, warning_count)

    status = AuditResult.Status.FAILED if critical_count > 0 else AuditResult.Status.APPROVED

    # Eliminar resultado previo para permitir re-auditoría (OneToOneField)
    AuditResult.objects.filter(uploaded_file=uploaded_file).delete()

    audit_result = AuditResult.objects.create(
        uploaded_file=uploaded_file,
        status=status,
    )
    persist_findings(audit_result, findings)

    uploaded_file.score = score
    uploaded_file.save(update_fields=["score"])

    return {
        "audit_result_id": audit_result.id,
        "score": score,
        "critical_count": critical_count,
        "warning_count": warning_count,
    }
