"""
WCAG 2.4.6 — Headings and Labels · Nivel AA

Detecta:
- Más de un <h1> en el documento.
- Saltos de jerarquía (e.g. <h2> → <h4> sin <h3>).
"""

from __future__ import annotations

from typing import Any

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


RULE_CODE  = "WCAG 2.4.6"
WCAG_LEVEL = "AA"
SEVERITY   = "warning"

HEADING_TAGS = [f"h{i}" for i in range(1, 7)]


def detect_heading_structure_findings(html_content: str) -> list[WcagFinding]:
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    headings: list[Any] = [t for t in soup.find_all(HEADING_TAGS) if getattr(t, "name", "")]

    if not headings:
        return []

    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    # Más de un <h1>
    h1_tags = [t for t in headings if t.name.lower() == "h1"]
    if len(h1_tags) > 1:
        for tag in h1_tags[1:]:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=RULE_CODE,
                wcag_level=WCAG_LEVEL,
                severity=SEVERITY,
                message="Se detectó más de un <h1>; usa un único encabezado principal por documento.",
                category="heading-h1",
            ))

    # Saltos de jerarquía
    previous_level: int | None = None
    for tag in headings:
        current_level = int(tag.name[1])
        if previous_level is not None and current_level > previous_level + 1:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=RULE_CODE,
                wcag_level=WCAG_LEVEL,
                severity=SEVERITY,
                message=(
                    f"Salto de jerarquía detectado: se pasó de <h{previous_level}> "
                    f"a <h{current_level}> sin usar <h{previous_level + 1}>."
                ),
                category="heading-hierarchy",
            ))
        previous_level = current_level

    return findings
