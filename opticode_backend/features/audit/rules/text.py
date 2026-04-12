"""
Reglas de comprensibilidad y legibilidad del texto.

Criterios cubiertos:
- WCAG 3.1.3 — Unusual Words · Nivel AAA
- WCAG 3.1.4 — Abbreviations · Nivel AAA
- WCAG 3.1.5 — Reading Level · Nivel AAA
- WCAG 3.1.6 — Pronunciation · Nivel AAA
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup, Comment

from ._utils import WcagFinding, make_finding


def _visible_text(soup: BeautifulSoup) -> str:
    """
    Extrae solo el texto visible del documento: excluye comentarios HTML,
    contenido de <script> y <style>, y cualquier NavigableString que no
    sea texto real del usuario.
    """
    _SKIP_TAGS = {"script", "style"}
    parts: list[str] = []
    for node in soup.find_all(string=True):
        if isinstance(node, Comment):
            continue
        if node.parent and node.parent.name in _SKIP_TAGS:
            continue
        text = str(node).strip()
        if text:
            parts.append(text)
    return " ".join(parts)


# ---------------------------------------------------------------------------
# WCAG 3.1.3 — Unusual Words · Nivel AAA
# ---------------------------------------------------------------------------

_UW_RULE_CODE  = "WCAG 3.1.3"
_UW_WCAG_LEVEL = "AAA"
_UW_SEVERITY   = "warning"


def detect_unusual_words_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta ausencia de mecanismos de definición de palabras inusuales o
    frases idiomáticas: <dfn>, <dl>/<dt>/<dd> o role="definition".

    Personas con trastornos cognitivos o bajo nivel de lectura necesitan
    que los términos especializados o inusuales estén definidos en el propio
    documento o mediante un enlace a un glosario.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    has_dfn = bool(soup.find("dfn"))
    has_dl  = bool(soup.find("dl"))
    has_role_def = bool(soup.find(attrs={"role": "definition"}))

    if has_dfn or has_dl or has_role_def:
        return []

    # Solo reporta si el documento tiene texto visible de cierta longitud
    text = _visible_text(soup)
    if len(text.split()) < 50:
        return []

    return [make_finding(
        line_number=1,
        source_lines=source_lines,
        wcag_rule=_UW_RULE_CODE,
        wcag_level=_UW_WCAG_LEVEL,
        severity=_UW_SEVERITY,
        message=(
            "El documento no contiene mecanismos de definición de palabras "
            "(<dfn>, <dl>/<dt>/<dd> o role=\"definition\"). "
            "Define términos inusuales o técnicos para mejorar la comprensión."
        ),
        category="unusual-words-no-definition",
    )]


# ---------------------------------------------------------------------------
# WCAG 3.1.4 — Abbreviations · Nivel AAA
# ---------------------------------------------------------------------------

_ABB_RULE_CODE  = "WCAG 3.1.4"
_ABB_WCAG_LEVEL = "AAA"
_ABB_SEVERITY   = "warning"

# Patrón: secuencia de 2 o más letras mayúsculas (siglas/acrónimos)
_ACRONYM_RE = re.compile(r"\b[A-ZÁÉÍÓÚÑ]{2,}\b")


def detect_abbreviations_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta siglas o acrónimos (secuencias de mayúsculas) en el texto visible
    que no están envueltos en <abbr title="...">.

    Las siglas sin expansión son incomprensibles para usuarios que no conocen
    el dominio y para síntesis de voz, que las leerá letra por letra.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    # Recopilar siglas ya marcadas con <abbr>
    covered: set[str] = set()
    for abbr in soup.find_all("abbr"):
        term = abbr.get_text(strip=True).upper()
        if term:
            covered.add(term)

    # Buscar siglas en nodos de texto (fuera de <abbr>, <script>, <style>)
    seen_uncovered: set[str] = set()
    for text_node in soup.find_all(string=True):
        if isinstance(text_node, Comment):
            continue
        parent = text_node.parent
        if parent and parent.name in {"script", "style", "abbr"}:
            continue

        for match in _ACRONYM_RE.finditer(str(text_node)):
            acronym = match.group(0)
            if acronym in covered or acronym in seen_uncovered:
                continue
            seen_uncovered.add(acronym)

            # Determinar número de línea aproximado
            line_num = 1
            if hasattr(parent, "sourceline") and parent.sourceline:
                line_num = parent.sourceline

            findings.append(make_finding(
                line_number=line_num,
                source_lines=source_lines,
                wcag_rule=_ABB_RULE_CODE,
                wcag_level=_ABB_WCAG_LEVEL,
                severity=_ABB_SEVERITY,
                message=(
                    f'Sigla o acrónimo "{acronym}" sin elemento <abbr title="...">. '
                    "Envuelve la primera aparición en <abbr title=\"expansión\"> para "
                    "que los lectores de pantalla puedan expandirla."
                ),
                category="abbreviation-unexpanded",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 3.1.5 — Reading Level · Nivel AAA
# ---------------------------------------------------------------------------

_RL_RULE_CODE  = "WCAG 3.1.5"
_RL_WCAG_LEVEL = "AAA"
_RL_SEVERITY   = "warning"

_MAX_GRADE_LEVEL = 13.0  # umbral ajustado para español: Flesch-Kincaid infla el
                         # score en lenguas romances por su mayor densidad silábica.
                         # Grado 13 equivale aproximadamente a bachillerato en inglés,
                         # que corresponde a secundaria completa en español.


def _ensure_cmudict() -> bool:
    """
    Descarga el corpus cmudict de NLTK si no está disponible.
    Devuelve True si el corpus está listo, False si no se pudo obtener.
    """
    import ssl  # noqa: PLC0415
    try:
        import nltk  # noqa: PLC0415
        try:
            nltk.data.find("corpora/cmudict")
            return True
        except LookupError:
            pass
        # Intentar descarga desactivando SSL (necesario en macOS con Python del sistema)
        try:
            _create_unverified = ssl._create_unverified_context
        except AttributeError:
            pass
        else:
            ssl._create_default_https_context = _create_unverified
        nltk.download("cmudict", quiet=True)
        return True
    except Exception:  # noqa: BLE001
        return False


def detect_reading_level_findings(html_content: str) -> list[WcagFinding]:
    """
    Calcula el nivel de lectura del texto visible usando Flesch-Kincaid Grade Level.

    Un nivel superior a 9 indica texto que requiere educación secundaria o
    superior para entenderse. WCAG recomienda proveer versiones simplificadas
    o material suplementario cuando el nivel de lectura es elevado.

    Requiere: pip install textstat
    """
    if not html_content or not str(html_content).strip():
        return []

    try:
        import textstat  # noqa: PLC0415
    except ImportError:
        return []

    if not _ensure_cmudict():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    text = _visible_text(soup)

    # Mínimo de palabras para que el análisis sea significativo
    word_count = len(text.split())
    if word_count < 30:
        return []

    grade = textstat.flesch_kincaid_grade(text)

    if grade <= _MAX_GRADE_LEVEL:
        return []

    return [make_finding(
        line_number=1,
        source_lines=source_lines,
        wcag_rule=_RL_RULE_CODE,
        wcag_level=_RL_WCAG_LEVEL,
        severity=_RL_SEVERITY,
        message=(
            f"El nivel de lectura del texto es {grade:.1f} (Flesch-Kincaid Grade), "
            f"superior al nivel secundario básico ({_MAX_GRADE_LEVEL}). "
            "Simplifica el lenguaje o proporciona una versión alternativa más accesible."
        ),
        category="reading-level-too-high",
    )]


# ---------------------------------------------------------------------------
# WCAG 3.1.6 — Pronunciation · Nivel AAA
# ---------------------------------------------------------------------------

_PRON_RULE_CODE  = "WCAG 3.1.6"
_PRON_WCAG_LEVEL = "AAA"
_PRON_SEVERITY   = "warning"

# Palabras cuya pronunciación cambia el significado (homógrafas comunes en español)
_AMBIGUOUS_WORDS_ES = {
    "solo", "mas", "aun", "este", "ese", "aquel",
    "como", "cuando", "donde", "quien",
}


def detect_pronunciation_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta ausencia de <ruby> en documentos que contienen palabras cuya
    pronunciación es ambigua o cambia el significado.

    <ruby> es el mecanismo estándar HTML para anotaciones de pronunciación
    (originalmente para CJK, pero aplicable a cualquier idioma).

    Heurística: si el documento contiene palabras homógrafas comunes en
    español y no usa <ruby>, se reporta como posible deficiencia.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()

    # Si ya usa <ruby>, el criterio puede estar cubierto
    if soup.find("ruby"):
        return []

    text = _visible_text(soup).lower()

    # Verificar si el documento tiene palabras que requieren pronunciación explícita
    words_in_text = set(re.findall(r"\b\w+\b", text))
    ambiguous_found = words_in_text & _AMBIGUOUS_WORDS_ES

    if not ambiguous_found:
        return []

    sample = ", ".join(sorted(ambiguous_found)[:5])

    return [make_finding(
        line_number=1,
        source_lines=source_lines,
        wcag_rule=_PRON_RULE_CODE,
        wcag_level=_PRON_WCAG_LEVEL,
        severity=_PRON_SEVERITY,
        message=(
            f"El documento contiene palabras de pronunciación ambigua ({sample}…) "
            "sin anotaciones <ruby> ni indicaciones de pronunciación. "
            "Considera usar <ruby> o tildes diacríticas para palabras homógrafas clave."
        ),
        category="pronunciation-ambiguous",
    )]
