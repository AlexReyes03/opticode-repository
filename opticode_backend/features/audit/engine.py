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

    Claves opcionales habituales en ``f`` (se usan fallbacks para compatibilidad):
    - ``severity`` (error | warning | critical)
    - ``wcag_rule``
    - ``message`` o ``description``
    - ``line_number`` o ``line``
    - ``code_snippet``

    :param audit_result: Reporte padre ya persistido.
    :param findings: Lista de dicts retornados por las reglas.
    :returns: Instancias creadas (aún no guardadas individualmente; se usa bulk_create).
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
        # PositiveIntegerField: valores estrictamente > 0 en Django.
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

    - Ejecuta reglas (si se proveen) contra `content`.
    - Calcula score = 100 − 10×críticas − 5×advertencias (mínimo 0).
    - Crea AuditResult + Finding(s) y persiste `UploadedFile.score`.

    Nota: si `rules` o `content` no se proporcionan, se asume `findings=[]` y el score será 100.
    Esto permite integrar el orquestador de forma incremental sin romper el flujo de subida.

    :returns: {
      "audit_result_id": int,
      "score": float,
      "critical_count": int,
      "warning_count": int,
    }
    """
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
