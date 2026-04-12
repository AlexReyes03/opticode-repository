"""
WCAG 1.1.1 — Non-text Content · Nivel A

Detecta:
- <img> sin atributo alt (ausencia total — alt="" es válido para imágenes decorativas).
- <svg> sin <title> hijo ni aria-label/aria-labelledby.
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


RULE_CODE  = "WCAG 1.1.1"
WCAG_LEVEL = "A"
SEVERITY   = "error"


def detect_image_alt_findings(html_content: str) -> list[WcagFinding]:
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    # <img> sin atributo alt
    for tag in soup.find_all("img"):
        if tag.get("alt") is None:
            src = tag.get("src", "")
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=RULE_CODE,
                wcag_level=WCAG_LEVEL,
                severity=SEVERITY,
                message=(
                    f'<img src="{src}"> no tiene atributo alt. '
                    "Añade alt=\"\" si es decorativa o una descripción si transmite información."
                ),
                category="image-missing-alt",
            ))

    # <svg> sin nombre accesible
    for tag in soup.find_all("svg"):
        has_title       = bool(tag.find("title"))
        has_aria_label  = bool(tag.get("aria-label", "").strip())
        has_labelledby  = bool(tag.get("aria-labelledby", "").strip())

        if not (has_title or has_aria_label or has_labelledby):
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=RULE_CODE,
                wcag_level=WCAG_LEVEL,
                severity=SEVERITY,
                message=(
                    "<svg> sin nombre accesible. "
                    "Añade <title> como primer hijo o un atributo aria-label."
                ),
                category="svg-missing-accessible-name",
            ))

    return findings
