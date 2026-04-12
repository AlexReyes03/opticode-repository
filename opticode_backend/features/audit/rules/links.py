"""
Reglas de propósito y accesibilidad de enlaces.

Criterios cubiertos:
- WCAG 2.4.4 — Link Purpose (In Context) · Nivel A
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


# ---------------------------------------------------------------------------
# WCAG 2.4.4 — Link Purpose (In Context) · Nivel A
# ---------------------------------------------------------------------------

RULE_CODE  = "WCAG 2.4.4"
WCAG_LEVEL = "A"
SEVERITY   = "warning"

# Textos genéricos que no describen el destino del enlace (en minúsculas)
_GENERIC_LINK_TEXTS = {
    # Español
    "aquí", "aqui", "clic aquí", "clic aqui", "click aquí", "click aqui",
    "haz clic", "haz clic aquí", "ver más", "ver mas", "leer más", "leer mas",
    "más", "mas", "más información", "mas información", "más información", "más info",
    "este enlace", "enlace", "ir", "entrar", "continuar", "siguiente", "anterior",
    # Inglés
    "here", "click here", "read more", "more", "learn more", "this link",
    "link", "go", "continue", "next", "previous", "click",
}


def detect_link_purpose_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta <a> con texto genérico que no describe el destino del enlace y
    que tampoco tienen aria-label o aria-labelledby para complementarlo.

    Los lectores de pantalla permiten navegar entre enlaces por lista; un
    texto como "aquí" o "ver más" pierde todo contexto en ese modo.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all("a", href=True):
        # Si tiene aria-label o aria-labelledby, el propósito está cubierto
        if tag.get("aria-label", "").strip():
            continue
        if tag.get("aria-labelledby", "").strip():
            continue

        visible_text = tag.get_text(strip=True).lower()

        if visible_text in _GENERIC_LINK_TEXTS:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=RULE_CODE,
                wcag_level=WCAG_LEVEL,
                severity=SEVERITY,
                message=(
                    f'Enlace con texto genérico "{tag.get_text(strip=True)}". '
                    "El texto del enlace debe describir su destino. "
                    "Usa un texto descriptivo o añade aria-label."
                ),
                category="link-generic-text",
            ))

    return findings
