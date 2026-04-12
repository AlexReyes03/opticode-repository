"""
Reglas de contraste de color.

Criterios cubiertos:
- WCAG 1.4.3 — Contrast (Minimum) · Nivel AA  (texto, umbral 4.5:1)
- WCAG 1.4.11 — Non-text Contrast · Nivel AA  (bordes de UI, umbral 3:1)

Formatos de color soportados: hex (#rgb, #rrggbb, #rrggbbaa), nombres CSS,
rgb(), rgba().

Limitación conocida: solo analiza CSS declarado estáticamente; no resuelve
colores heredados ni variables CSS.
"""

from __future__ import annotations

from typing import Any

import tinycss2
import webcolors

from ._utils import WcagFinding, build_snippet


# ---------------------------------------------------------------------------
# Parseo de color (compartido)
# ---------------------------------------------------------------------------

def _parse_hex(value: str) -> tuple[int, int, int]:
    """Parsea #rgb, #rrggbb o #rrggbbaa → (r, g, b). Lanza ValueError si inválido."""
    v = value.lstrip("#")
    if len(v) == 3:
        return tuple(int(c * 2, 16) for c in v)  # type: ignore[return-value]
    if len(v) in (6, 8):
        return int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16)
    raise ValueError(f"Hex inválido: {value}")


def _parse_named(name: str) -> tuple[int, int, int] | None:
    try:
        return _parse_hex(webcolors.name_to_hex(name.lower()))
    except (ValueError, AttributeError):
        return None


def _parse_rgb_function(func: Any) -> tuple[int, int, int] | None:
    numbers = [t for t in func.arguments if t.type == "number"]
    if len(numbers) < 3:
        return None
    try:
        r = max(0, min(255, round(float(numbers[0].value))))
        g = max(0, min(255, round(float(numbers[1].value))))
        b = max(0, min(255, round(float(numbers[2].value))))
        return r, g, b
    except (TypeError, ValueError):
        return None


def _extract_color(tokens: list[Any]) -> tuple[int, int, int] | None:
    for token in tokens:
        if token.type == "hash":
            try:
                return _parse_hex("#" + token.value)
            except ValueError:
                pass
        elif token.type == "ident":
            color = _parse_named(token.value)
            if color is not None:
                return color
        elif token.type == "function" and token.lower_name in ("rgb", "rgba"):
            color = _parse_rgb_function(token)
            if color is not None:
                return color
    return None


# ---------------------------------------------------------------------------
# Cálculo de contraste WCAG (compartido)
# ---------------------------------------------------------------------------

def _linearize(c: int) -> float:
    c_norm = c / 255
    return c_norm / 12.92 if c_norm <= 0.04045 else ((c_norm + 0.055) / 1.055) ** 2.4


def _relative_luminance(r: int, g: int, b: int) -> float:
    return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b)


def contrast_ratio(rgb1: tuple[int, int, int], rgb2: tuple[int, int, int]) -> float:
    """Calcula el ratio de contraste WCAG entre dos colores RGB."""
    l1 = _relative_luminance(*rgb1)
    l2 = _relative_luminance(*rgb2)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


# ---------------------------------------------------------------------------
# WCAG 1.4.3 — Contrast (Minimum) · Nivel AA
# ---------------------------------------------------------------------------

_MIN_RULE_CODE  = "WCAG 1.4.3"
_MIN_WCAG_LEVEL = "AA"
_MIN_SEVERITY   = "error"
_MIN_THRESHOLD  = 4.5


def detect_contrast_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta reglas CSS cuyo ratio de contraste texto/fondo es inferior a 4.5:1.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in tinycss2.parse_stylesheet(css_content, skip_whitespace=True, skip_comments=True):
        if rule.type != "qualified-rule":
            continue

        declarations = tinycss2.parse_declaration_list(
            rule.content, skip_whitespace=True, skip_comments=True
        )

        foreground: tuple[int, int, int] | None = None
        bg_explicit: tuple[int, int, int] | None = None
        bg_shorthand: tuple[int, int, int] | None = None

        for decl in declarations:
            if decl.type != "declaration":
                continue
            if decl.lower_name == "color":
                foreground = _extract_color(decl.value)
            elif decl.lower_name == "background-color":
                bg_explicit = _extract_color(decl.value)
            elif decl.lower_name == "background":
                bg_shorthand = _extract_color(decl.value)

        background = bg_explicit if bg_explicit is not None else bg_shorthand

        if foreground is None or background is None:
            continue

        ratio = contrast_ratio(foreground, background)
        if ratio >= _MIN_THRESHOLD:
            continue

        selector = "".join(t.serialize() for t in rule.prelude).strip()
        line_num  = max(1, rule.source_line)

        findings.append(WcagFinding(
            severity=_MIN_SEVERITY,
            wcag_level=_MIN_WCAG_LEVEL,
            wcag_rule=_MIN_RULE_CODE,
            message=(
                f'Contraste insuficiente en "{selector}": '
                f"ratio {ratio:.2f}:1 (mínimo {_MIN_THRESHOLD}:1)."
            ),
            line_number=line_num,
            code_snippet=build_snippet(source_lines, line_num),
            category="color-contrast",
        ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 1.4.11 — Non-text Contrast · Nivel AA
# ---------------------------------------------------------------------------

_NTC_RULE_CODE  = "WCAG 1.4.11"
_NTC_WCAG_LEVEL = "AA"
_NTC_SEVERITY   = "error"
_NTC_THRESHOLD  = 3.0

# Selectores que apuntan a componentes de interfaz (heurística)
_UI_COMPONENT_PATTERNS = [
    "button", "input", "select", "textarea",
    "[type=", "[role=\"button\"]", "[role='button']",
]


def detect_nontext_contrast_findings(css_content: str) -> list[WcagFinding]:
    """
    Detecta componentes de interfaz (botones, inputs) cuyo borde tiene ratio
    de contraste contra el fondo inferior a 3:1.

    Un borde con contraste insuficiente hace que el límite visual del
    componente sea invisible para personas con baja visión.
    """
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[WcagFinding] = []

    for rule in tinycss2.parse_stylesheet(css_content, skip_whitespace=True, skip_comments=True):
        if rule.type != "qualified-rule":
            continue

        selector = "".join(t.serialize() for t in rule.prelude).strip()
        if not any(p in selector.lower() for p in _UI_COMPONENT_PATTERNS):
            continue

        declarations = tinycss2.parse_declaration_list(
            rule.content, skip_whitespace=True, skip_comments=True
        )

        border_color: tuple[int, int, int] | None = None
        background:   tuple[int, int, int] | None = None

        for decl in declarations:
            if decl.type != "declaration":
                continue
            if decl.lower_name in ("border-color", "border"):
                border_color = _extract_color(decl.value)
            elif decl.lower_name == "background-color":
                background = _extract_color(decl.value)
            elif decl.lower_name == "background" and background is None:
                background = _extract_color(decl.value)

        if border_color is None or background is None:
            continue

        ratio = contrast_ratio(border_color, background)
        if ratio >= _NTC_THRESHOLD:
            continue

        line_num = max(1, rule.source_line)
        findings.append(WcagFinding(
            severity=_NTC_SEVERITY,
            wcag_level=_NTC_WCAG_LEVEL,
            wcag_rule=_NTC_RULE_CODE,
            message=(
                f'Contraste de borde insuficiente en "{selector}": '
                f"ratio {ratio:.2f}:1 (mínimo {_NTC_THRESHOLD}:1). "
                "El límite visual del componente puede ser invisible con baja visión."
            ),
            line_number=line_num,
            code_snippet=build_snippet(source_lines, line_num),
            category="nontext-contrast",
        ))

    return findings
