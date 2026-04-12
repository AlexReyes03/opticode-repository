from __future__ import annotations

from typing import Any

from bs4 import BeautifulSoup


HEADING_TAGS = [f"h{i}" for i in range(1, 7)]
HEADING_RULE_CODE = "WCAG 2.4.6"


def _line_number(tag: Any) -> int:
    line_number = getattr(tag, "sourceline", None)
    try:
        return max(1, int(line_number))
    except (TypeError, ValueError):
        return 1


def _build_context_snippet(source_lines: list[str], line_number: int) -> str:
    """Retorna las 3 líneas de contexto alrededor de line_number (1-based), separadas por \\n."""
    idx = line_number - 1  # convertir a 0-based
    start = max(0, idx - 1)
    end = min(len(source_lines), idx + 2)
    return "\n".join(source_lines[start:end])


def _build_finding(
    *,
    tag: Any,
    message: str,
    category: str,
    source_lines: list[str],
) -> dict[str, Any]:
    line_num = _line_number(tag)
    return {
        "severity": "warning",
        "wcag_level": "AA",
        "wcag_rule": HEADING_RULE_CODE,
        "message": message,
        "line_number": line_num,
        "code_snippet": _build_context_snippet(source_lines, line_num),
        "category": category,
    }


def detect_heading_structure_findings(html_content: str) -> list[dict[str, Any]]:
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    headings = [tag for tag in soup.find_all(HEADING_TAGS) if getattr(tag, "name", "")]

    if not headings:
        return []

    source_lines = html_content.splitlines()
    findings: list[dict[str, Any]] = []
    h1_tags = [tag for tag in headings if tag.name.lower() == "h1"]

    if len(h1_tags) > 1:
        for tag in h1_tags[1:]:
            findings.append(
                _build_finding(
                    tag=tag,
                    category="heading-h1",
                    message="Se detecto mas de un <h1>; usa un unico encabezado principal por documento.",
                    source_lines=source_lines,
                )
            )

    previous_level: int | None = None
    for tag in headings:
        current_level = int(tag.name[1])
        if previous_level is not None and current_level > previous_level + 1:
            findings.append(
                _build_finding(
                    tag=tag,
                    category="heading-hierarchy",
                    message=(
                        f"Salto de jerarquia detectado: se paso de <h{previous_level}> "
                        f"a <h{current_level}> sin usar <h{previous_level + 1}>."
                    ),
                    source_lines=source_lines,
                )
            )
        previous_level = current_level

    return findings
