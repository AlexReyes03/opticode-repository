"""
Reglas CSS para propiedades visuales y de interacción.

Criterios cubiertos:
- WCAG 2.4.7 — Focus Visible · Nivel AA
- WCAG 1.4.4 — Resize Text · Nivel AA
- WCAG 1.4.12 — Text Spacing · Nivel AA
- WCAG 1.3.4 — Orientation · Nivel AA
- WCAG 2.5.8 — Target Size (Minimum) · Nivel AA
"""

from __future__ import annotations

from typing import Any

import tinycss2

from ._utils import WcagFinding, build_snippet


def _selector(rule: Any) -> str:
    return "".join(t.serialize() for t in rule.prelude).strip()


def _declarations(rule: Any) -> list[Any]:
    return tinycss2.parse_declaration_list(
        rule.content, skip_whitespace=True, skip_comments=True
    )


def _serialize_value(tokens: list[Any]) -> str:
    return "".join(t.serialize() for t in tokens).strip().lower()


def _parsed_rules(css_content: str) -> list[Any]:
    return tinycss2.parse_stylesheet(
        css_content, skip_whitespace=True, skip_comments=True
    )


# ---------------------------------------------------------------------------
# WCAG 2.4.7 — Focus Visible · Nivel AA
# ---------------------------------------------------------------------------

_FOCUS_RULE_CODE  = "WCAG 2.4.7"
_FOCUS_WCAG_LEVEL = "AA"
_FOCUS_SEVERITY   = "error"

# Valores de outline que eliminan el indicador de foco
_INVISIBLE_OUTLINE = {"none", "0", "0px", "0em", "0rem"}


def detect_focus_visible_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta selectores que contienen :focus y declaran outline: none / outline: 0.

    Eliminar el indicador de foco es la causa más directa de inaccesibilidad
    por teclado: los usuarios que navegan con Tab no saben dónde están.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in _parsed_rules(css_content):
        if rule.type != "qualified-rule":
            continue

        sel = _selector(rule)
        if ":focus" not in sel.lower():
            continue

        for decl in _declarations(rule):
            if decl.type != "declaration":
                continue

            value = _serialize_value(decl.value)

            if decl.lower_name == "outline" and value in _INVISIBLE_OUTLINE:
                line_num = max(1, rule.source_line)
                findings.append(WcagFinding(
                    severity=_FOCUS_SEVERITY,
                    wcag_level=_FOCUS_WCAG_LEVEL,
                    wcag_rule=_FOCUS_RULE_CODE,
                    message=(
                        f'"{sel}" declara outline: {value}, '
                        "eliminando el indicador visual de foco. "
                        "Usa outline: none solo si provees un indicador alternativo visible."
                    ),
                    line_number=line_num,
                    code_snippet=build_snippet(source_lines, line_num),
                    category="focus-outline-removed",
                ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 1.4.4 — Resize Text · Nivel AA
# ---------------------------------------------------------------------------

_RESIZE_RULE_CODE  = "WCAG 1.4.4"
_RESIZE_WCAG_LEVEL = "AA"
_RESIZE_SEVERITY   = "warning"


def detect_resize_text_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta font-size declarado con unidades px fijas.

    Las unidades px no escalan cuando el usuario cambia el tamaño de fuente
    base del navegador, impidiendo que personas con baja visión amplíen el
    texto sin usar el zoom de página completa.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in _parsed_rules(css_content):
        if rule.type != "qualified-rule":
            continue

        sel = _selector(rule)

        for decl in _declarations(rule):
            if decl.type != "declaration" or decl.lower_name != "font-size":
                continue

            for token in decl.value:
                if token.type == "dimension" and token.lower_unit == "px":
                    line_num = max(1, rule.source_line)
                    findings.append(WcagFinding(
                        severity=_RESIZE_SEVERITY,
                        wcag_level=_RESIZE_WCAG_LEVEL,
                        wcag_rule=_RESIZE_RULE_CODE,
                        message=(
                            f'"{sel}" usa font-size: {token.value}px (unidad fija). '
                            "Usa rem, em o % para que el texto escale con la preferencia del usuario."
                        ),
                        line_number=line_num,
                        code_snippet=build_snippet(source_lines, line_num),
                        category="font-size-fixed-px",
                    ))
                    break  # un hallazgo por declaración

    return findings


# ---------------------------------------------------------------------------
# WCAG 1.4.12 — Text Spacing · Nivel AA
# ---------------------------------------------------------------------------

_SPACING_RULE_CODE  = "WCAG 1.4.12"
_SPACING_WCAG_LEVEL = "AA"
_SPACING_SEVERITY   = "error"

_TEXT_SPACING_PROPS = {
    "line-height", "letter-spacing", "word-spacing",
    "margin-top", "margin-bottom", "padding-top", "padding-bottom",
}


def detect_text_spacing_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta declaraciones de espaciado de texto con !important.

    Los usuarios con dislexia u otras necesidades ajustan el espaciado del
    texto mediante hojas de estilo propias o extensiones del navegador.
    El uso de !important bloquea esos ajustes.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in _parsed_rules(css_content):
        if rule.type != "qualified-rule":
            continue

        sel = _selector(rule)

        for decl in _declarations(rule):
            if decl.type != "declaration":
                continue
            if not decl.important:
                continue
            if decl.lower_name not in _TEXT_SPACING_PROPS:
                continue

            line_num = max(1, rule.source_line)
            findings.append(WcagFinding(
                severity=_SPACING_SEVERITY,
                wcag_level=_SPACING_WCAG_LEVEL,
                wcag_rule=_SPACING_RULE_CODE,
                message=(
                    f'"{sel}" declara {decl.lower_name}: ... !important, '
                    "bloqueando ajustes de espaciado del usuario. "
                    "Elimina !important en propiedades de espaciado de texto."
                ),
                line_number=line_num,
                code_snippet=build_snippet(source_lines, line_num),
                category="text-spacing-important",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 1.3.4 — Orientation · Nivel AA
# ---------------------------------------------------------------------------

_ORIENT_RULE_CODE  = "WCAG 1.3.4"
_ORIENT_WCAG_LEVEL = "AA"
_ORIENT_SEVERITY   = "error"

# Propiedades que ocultarían contenido en una orientación
_BLOCKING_PROPS = {"display", "visibility", "transform"}


def detect_orientation_lock_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta bloques @media (orientation) que ocultan contenido o lo rotan,
    bloqueando efectivamente una orientación de pantalla.

    Personas que tienen el dispositivo montado fijo (silla de ruedas, soporte)
    no pueden cambiar la orientación física.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in _parsed_rules(css_content):
        if rule.type != "at-rule" or rule.lower_at_keyword != "media":
            continue
        if rule.content is None:
            continue

        prelude = "".join(t.serialize() for t in rule.prelude).lower()
        if "orientation" not in prelude:
            continue

        nested = tinycss2.parse_rule_list(
            rule.content, skip_whitespace=True, skip_comments=True
        )

        for nested_rule in nested:
            if nested_rule.type != "qualified-rule":
                continue

            nested_sel = _selector(nested_rule)
            nested_decls = tinycss2.parse_declaration_list(
                nested_rule.content, skip_whitespace=True, skip_comments=True
            )

            for decl in nested_decls:
                if decl.type != "declaration":
                    continue
                if decl.lower_name not in _BLOCKING_PROPS:
                    continue

                value = _serialize_value(decl.value)

                blocks = (
                    (decl.lower_name == "display" and value == "none") or
                    (decl.lower_name == "visibility" and value == "hidden") or
                    (decl.lower_name == "transform" and "rotate" in value)
                )

                if blocks:
                    line_num = max(1, nested_rule.source_line)
                    findings.append(WcagFinding(
                        severity=_ORIENT_SEVERITY,
                        wcag_level=_ORIENT_WCAG_LEVEL,
                        wcag_rule=_ORIENT_RULE_CODE,
                        message=(
                            f'@media ({prelude.strip()}) — "{nested_sel}" '
                            f"declara {decl.lower_name}: {value}, "
                            "bloqueando el contenido en esa orientación."
                        ),
                        line_number=line_num,
                        code_snippet=build_snippet(source_lines, line_num),
                        category="orientation-lock",
                    ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 2.5.8 — Target Size (Minimum) · Nivel AA
# ---------------------------------------------------------------------------

_TARGET_RULE_CODE  = "WCAG 2.5.8"
_TARGET_WCAG_LEVEL = "AA"
_TARGET_SEVERITY   = "warning"

_INTERACTIVE_PATTERNS = [
    "button", "input", "select", "textarea",
    "[type=", "[role=\"button\"]", "[role='button']",
]

_SIZE_PROPS = {"width", "height", "min-width", "min-height"}

_MIN_TARGET_PX = 24.0


def detect_target_size_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta elementos interactivos con width o height menor a 24×24 px.

    Un objetivo de toque pequeño dificulta la interacción a personas con
    temblor, movilidad reducida o que usan dispositivos táctiles.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in _parsed_rules(css_content):
        if rule.type != "qualified-rule":
            continue

        sel = _selector(rule)
        if not any(pattern in sel.lower() for pattern in _INTERACTIVE_PATTERNS):
            continue

        small_dims: list[str] = []
        line_num = max(1, rule.source_line)

        for decl in _declarations(rule):
            if decl.type != "declaration":
                continue
            if decl.lower_name not in _SIZE_PROPS:
                continue

            for token in decl.value:
                if token.type != "dimension" or token.lower_unit != "px":
                    continue
                try:
                    px = float(token.value)
                except (ValueError, TypeError):
                    continue

                if px < _MIN_TARGET_PX:
                    small_dims.append(f"{decl.lower_name}: {px}px")
                break

        if small_dims:
            findings.append(WcagFinding(
                severity=_TARGET_SEVERITY,
                wcag_level=_TARGET_WCAG_LEVEL,
                wcag_rule=_TARGET_RULE_CODE,
                message=(
                    f'"{sel}" — {", ".join(small_dims)} '
                    f"inferior al mínimo de {int(_MIN_TARGET_PX)}px requerido. "
                    "Amplía el área de toque del elemento interactivo."
                ),
                line_number=line_num,
                code_snippet=build_snippet(source_lines, line_num),
                category="target-size-too-small",
            ))

    return findings
