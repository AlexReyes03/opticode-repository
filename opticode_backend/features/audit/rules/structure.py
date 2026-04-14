"""
Reglas de estructura del documento HTML.

Criterios cubiertos:
- WCAG 2.4.2 — Page Titled · Nivel A
- WCAG 3.1.1 — Language of Page · Nivel A
- WCAG 2.4.1 — Bypass Blocks · Nivel A
- WCAG 1.4.10 — Reflow · Nivel AA
- WCAG 2.4.10 — Section Headings · Nivel AAA
- WCAG 1.3.6 — Identify Purpose · Nivel AAA
"""

from __future__ import annotations

import re

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

_SKIP_LINK_PATTERNS = {
    "saltar", "saltar al contenido", "saltar navegación", "ir al contenido",
    "skip", "skip to content", "skip navigation", "skip to main",
}

_LANDMARK_TAGS = {"main", "nav", "header", "aside", "footer"}


def detect_bypass_blocks_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta la ausencia simultánea de skip link y landmarks semánticos.

    Un documento satisface 2.4.1 si tiene AL MENOS UNO de:
    - Un skip link (<a href="#..."> con texto identificativo).
    - Elementos landmark HTML5 o role="main" / role="navigation".
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    has_skip_link = False
    for tag in soup.find_all("a", href=True):
        href = str(tag.get("href", ""))
        if href.startswith("#") and tag.get_text(strip=True).lower() in _SKIP_LINK_PATTERNS:
            has_skip_link = True
            break

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
            'Añade un skip link (<a href="#main">Saltar al contenido</a>) '
            "o usa elementos semánticos HTML5 (<main>, <nav>, <header>)."
        ),
        category="bypass-blocks-missing",
    )]


# ---------------------------------------------------------------------------
# WCAG 1.4.10 — Reflow · Nivel AA
# ---------------------------------------------------------------------------

_REFLOW_RULE_CODE  = "WCAG 1.4.10"
_REFLOW_WCAG_LEVEL = "AA"
_REFLOW_SEVERITY   = "error"

_MAX_SCALE_PATTERN = re.compile(r"maximum-scale=([0-9.]+)")


def _normalized_viewport_content(tag) -> str:
    return str(tag.get("content", "")).lower().replace(" ", "")


def _viewport_zoom_disabled(content: str) -> bool:
    return "user-scalable=no" in content or "user-scalable=0" in content


def _extract_maximum_scale(content: str) -> float | None:
    match = _MAX_SCALE_PATTERN.search(content)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def _reflow_findings_for_viewport_tag(tag, source_lines: list[str]) -> list[WcagFinding]:
    content = _normalized_viewport_content(tag)
    findings: list[WcagFinding] = []

    if _viewport_zoom_disabled(content):
        findings.append(make_finding(
            tag=tag,
            source_lines=source_lines,
            wcag_rule=_REFLOW_RULE_CODE,
            wcag_level=_REFLOW_WCAG_LEVEL,
            severity=_REFLOW_SEVERITY,
            message=(
                "El meta viewport desactiva el zoom del usuario (user-scalable=no). "
                "Personas con baja visión no podrán ampliar el contenido."
            ),
            category="viewport-zoom-disabled",
        ))

    scale = _extract_maximum_scale(content)
    if scale is not None and scale <= 1.0:
        findings.append(make_finding(
            tag=tag,
            source_lines=source_lines,
            wcag_rule=_REFLOW_RULE_CODE,
            wcag_level=_REFLOW_WCAG_LEVEL,
            severity=_REFLOW_SEVERITY,
            message=(
                f"El meta viewport limita el zoom máximo a {scale} "
                "(maximum-scale≤1), impidiendo ampliar el contenido."
            ),
            category="viewport-max-scale-limited",
        ))

    return findings


def detect_reflow_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta <meta name="viewport"> que desactiva el zoom del usuario:
    - user-scalable=no / user-scalable=0
    - maximum-scale=1 (o menor)

    Sin zoom, personas con baja visión no pueden ampliar el contenido.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all("meta"):
        if tag.get("name", "").lower() != "viewport":
            continue
        findings.extend(_reflow_findings_for_viewport_tag(tag, source_lines))

    return findings


# ---------------------------------------------------------------------------
# WCAG 2.4.10 — Section Headings · Nivel AAA
# ---------------------------------------------------------------------------

_SH_RULE_CODE  = "WCAG 2.4.10"
_SH_WCAG_LEVEL = "AAA"
_SH_SEVERITY   = "warning"

_HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
_SECTION_TAGS = {"section", "article"}


def detect_section_headings_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta <section> y <article> sin un encabezado hijo directo (h1-h6)
    ni aria-label ni aria-labelledby.

    Las secciones sin encabezado son opacas para los lectores de pantalla:
    el usuario no puede entender la organización del documento navegando
    por encabezados.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all(_SECTION_TAGS):
        # La sección tiene nombre accesible via ARIA → aceptable
        if tag.get("aria-label", "").strip() or tag.get("aria-labelledby", "").strip():
            continue

        # Busca encabezado como hijo directo
        has_heading = any(child.name in _HEADING_TAGS for child in tag.children if hasattr(child, "name"))

        if not has_heading:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_SH_RULE_CODE,
                wcag_level=_SH_WCAG_LEVEL,
                severity=_SH_SEVERITY,
                message=(
                    f"<{tag.name}> sin encabezado hijo (h1-h6) ni aria-label. "
                    "Añade un encabezado descriptivo o usa aria-label para identificar la sección."
                ),
                category="section-without-heading",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 1.3.6 — Identify Purpose · Nivel AAA
# ---------------------------------------------------------------------------

_IP_RULE_CODE  = "WCAG 1.3.6"
_IP_WCAG_LEVEL = "AAA"
_IP_SEVERITY   = "warning"

_LANDMARK_ROLES = {
    "banner", "navigation", "main", "complementary",
    "contentinfo", "search", "form", "region",
}
_SEMANTIC_LANDMARKS = {"header", "nav", "main", "aside", "footer", "section", "form", "search"}


def detect_identify_purpose_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta ausencia de landmarks semánticos HTML5 y ARIA en el documento.

    WCAG 1.3.6 requiere que la finalidad de los componentes de la interfaz
    pueda determinarse programáticamente para que herramientas de asistencia
    puedan personalizar la presentación (iconos, símbolos, etc.).

    Heurística: reporta si el documento carece de elementos landmark
    (<main>, <nav>, <header>, <footer>) y no usa roles ARIA equivalentes.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    has_semantic = bool(soup.find(list(_SEMANTIC_LANDMARKS)))
    if not has_semantic:
        has_semantic = bool(
            soup.find(attrs={"role": lambda r: r and r.lower() in _LANDMARK_ROLES})
        )

    if has_semantic:
        return []

    return [make_finding(
        line_number=1,
        source_lines=source_lines,
        wcag_rule=_IP_RULE_CODE,
        wcag_level=_IP_WCAG_LEVEL,
        severity=_IP_SEVERITY,
        message=(
            "El documento no usa elementos landmark semánticos HTML5 "
            "(<main>, <nav>, <header>, <footer>) ni roles ARIA equivalentes. "
            "Los landmarks permiten a las herramientas de asistencia identificar "
            "la función de cada región de la página."
        ),
        category="identify-purpose-no-landmarks",
    )]
