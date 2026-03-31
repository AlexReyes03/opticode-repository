"""
Motor de persistencia de hallazgos de auditoría.

Las funciones de reglas devuelven diccionarios con clave `category` (categoría del
elemento o selector afectado). El modelo :class:`Finding` almacena ese valor en
`affected_element`.
"""

from __future__ import annotations

from typing import Any

from features.audit.models import AuditResult, Finding


def _normalize_severity(raw: str | None) -> str:
    """Alinea severidades de reglas con Finding.Severity (error | warning)."""
    if not raw:
        return Finding.Severity.WARNING
    s = str(raw).lower()
    if s in ("error", "critical"):
        return Finding.Severity.ERROR
    return Finding.Severity.WARNING


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
