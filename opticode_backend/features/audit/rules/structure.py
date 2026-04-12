"""
Reglas de estructura del documento HTML.

Criterios cubiertos:
- WCAG 2.4.2 — Page Titled · Nivel A
- WCAG 3.1.1 — Language of Page · Nivel A
- WCAG 2.4.1 — Bypass Blocks · Nivel A
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


# ---------------------------------------------------------------------------
# WCAG 2.4.2 — Page Titled · Nivel A
# ---------------------------------------------------------------------------

_TITLE_RULE_CODE  = "WCAG 2.4.2"
_TITLE_WCAG_LEVEL = "A"
_TITLE_SEVERITY   = "error"


def detect_page_title_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta:
    - Ausencia de elemento <title>.
    - <title> presente pero vacío.
    - <title> con menos de 3 palabras (título genérico o insuficiente).
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    title_tag = soup.find("title")

    if title_tag is None:
        return [make_finding(
            line_number=1,
            source_lines=source_lines,
            wcag_rule=_TITLE_RULE_CODE,
            wcag_level=_TITLE_WCAG_LEVEL,
            severity=_TITLE_SEVERITY,
            message="El documento no tiene elemento <title>.",
            category="page-title-missing",
        )]

    title_text = title_tag.get_text(strip=True)

    if not title_text:
        return [make_finding(
            tag=title_tag,
            source_lines=source_lines,
            wcag_rule=_TITLE_RULE_CODE,
            wcag_level=_TITLE_WCAG_LEVEL,
            severity=_TITLE_SEVERITY,
            message="El elemento <title> está vacío.",
            category="page-title-empty",
        )]

    if len(title_text.split()) < 3:
        return [make_finding(
            tag=title_tag,
            source_lines=source_lines,
            wcag_rule=_TITLE_RULE_CODE,
            wcag_level=_TITLE_WCAG_LEVEL,
            severity="warning",
            message=(
                f'El título de página "{title_text}" es demasiado corto o genérico '
                "(menos de 3 palabras). Usa un título descriptivo."
            ),
            category="page-title-generic",
        )]

    return []


# ---------------------------------------------------------------------------
# WCAG 3.1.1 — Language of Page · Nivel A
# ---------------------------------------------------------------------------

_LANG_RULE_CODE  = "WCAG 3.1.1"
_LANG_WCAG_LEVEL = "A"
_LANG_SEVERITY   = "error"


def detect_page_language_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta:
    - Elemento <html> sin atributo lang.
    - Atributo lang presente pero vacío.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    html_tag = soup.find("html")
    if html_tag is None:
        return []

    lang = html_tag.get("lang")

    if lang is None:
        return [make_finding(
            tag=html_tag,
            source_lines=source_lines,
            wcag_rule=_LANG_RULE_CODE,
            wcag_level=_LANG_WCAG_LEVEL,
            severity=_LANG_SEVERITY,
            message=(
                "El elemento <html> no tiene atributo lang. "
                "Los lectores de pantalla no podrán determinar el idioma del documento."
            ),
            category="page-language-missing",
        )]

    if not str(lang).strip():
        return [make_finding(
            tag=html_tag,
            source_lines=source_lines,
            wcag_rule=_LANG_RULE_CODE,
            wcag_level=_LANG_WCAG_LEVEL,
            severity=_LANG_SEVERITY,
            message='El atributo lang en <html> está vacío. Especifica un código de idioma (e.g. lang="es").',
            category="page-language-empty",
        )]

    return []


# ---------------------------------------------------------------------------
# WCAG 2.4.1 — Bypass Blocks · Nivel A
# ---------------------------------------------------------------------------

_BYPASS_RULE_CODE  = "WCAG 2.4.1"
_BYPASS_WCAG_LEVEL = "A"
_BYPASS_SEVERITY   = "warning"

# Texto de skip links reconocidos (patrones en minúsculas)
_SKIP_LINK_PATTERNS = {
    "saltar", "saltar al contenido", "saltar navegación", "ir al contenido",
    "skip", "skip to content", "skip navigation", "skip to main",
}

# Elementos semánticos HTML5 que actúan como landmarks
_LANDMARK_TAGS = {"main", "nav", "header", "aside", "footer"}


def detect_bypass_blocks_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta la ausencia simultánea de skip link y landmarks semánticos.

    Un documento satisface 2.4.1 si tiene AL MENOS UNO de:
    - Un skip link: <a href="#..."> con texto que identifica el salto.
    - Elementos landmark HTML5 (<main>, <nav>, <header>, etc.) o
      role="main" / role="navigation".
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    # Buscar skip link: <a href="#..."> cuyo texto coincida con patrones conocidos
    has_skip_link = False
    for tag in soup.find_all("a", href=True):
        href = str(tag.get("href", ""))
        if href.startswith("#") and tag.get_text(strip=True).lower() in _SKIP_LINK_PATTERNS:
            has_skip_link = True
            break

    # Buscar landmarks semánticos
    has_landmark = bool(soup.find(_LANDMARK_TAGS))
    if not has_landmark:
        has_landmark = bool(
            soup.find(attrs={"role": "main"}) or
            soup.find(attrs={"role": "navigation"}) or
            soup.find(attrs={"role": "banner"})
        )

    if has_skip_link or has_landmark:
        return []

    return [make_finding(
        line_number=1,
        source_lines=source_lines,
        wcag_rule=_BYPASS_RULE_CODE,
        wcag_level=_BYPASS_WCAG_LEVEL,
        severity=_BYPASS_SEVERITY,
        message=(
            "El documento no tiene mecanismo para saltar bloques de contenido repetido. "
            "Añade un skip link (<a href=\"#main\">Saltar al contenido</a>) "
            "o usa elementos semánticos HTML5 (<main>, <nav>, <header>)."
        ),
        category="bypass-blocks-missing",
    )]
