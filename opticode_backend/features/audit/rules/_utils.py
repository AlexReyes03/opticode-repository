"""
Utilidades compartidas para las reglas del motor WCAG.

Centraliza:
- ``WcagFinding``: TypedDict con el contrato de un hallazgo.
- ``get_source_line()``: extrae el número de línea de un tag BeautifulSoup.
- ``build_snippet()``: retorna contexto de 3 líneas alrededor de un número de línea.
- ``make_finding()``: construye un WcagFinding con todos los campos requeridos.
"""

from __future__ import annotations

from typing import Any

from typing import TypedDict


class WcagFinding(TypedDict):
    """Contrato de un hallazgo de auditoría WCAG."""

    severity: str       # "error" | "warning" | "improvement"
    wcag_level: str     # "A" | "AA" | "AAA"
    wcag_rule: str      # e.g. "WCAG 1.1.1"
    message: str
    line_number: int
    code_snippet: str
    category: str


def get_source_line(tag: Any) -> int:
    """Retorna el número de línea (1-based) de un tag BeautifulSoup."""
    raw = getattr(tag, "sourceline", None)
    try:
        return max(1, int(raw))
    except (TypeError, ValueError):
        return 1


def build_snippet(source_lines: list[str], line_number: int) -> str:
    """Retorna las 3 líneas de contexto alrededor de ``line_number`` (1-based)."""
    idx = line_number - 1
    start = max(0, idx - 1)
    end = min(len(source_lines), idx + 2)
    return "\n".join(source_lines[start:end])


def make_finding(
    *,
    wcag_rule: str,
    wcag_level: str,
    severity: str,
    message: str,
    category: str,
    source_lines: list[str],
    tag: Any | None = None,
    line_number: int | None = None,
) -> WcagFinding:
    """
    Construye un :class:`WcagFinding` listo para ser retornado por una regla.

    Se debe proveer ``tag`` (tag BeautifulSoup) **o** ``line_number`` (entero
    explícito). Si se proveen ambos, ``line_number`` tiene prioridad.
    """
    if line_number is None:
        line_number = get_source_line(tag) if tag is not None else 1

    return WcagFinding(
        severity=severity,
        wcag_level=wcag_level,
        wcag_rule=wcag_rule,
        message=message,
        line_number=line_number,
        code_snippet=build_snippet(source_lines, line_number),
        category=category,
    )
