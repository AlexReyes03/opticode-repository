from __future__ import annotations

from typing import Any

import tinycss2
import webcolors


CONTRAST_RULE_CODE = "WCAG 1.4.3"
CONTRAST_THRESHOLD = 4.5


# ---------------------------------------------------------------------------
# Color parsing
# ---------------------------------------------------------------------------

def _parse_hex(value: str) -> tuple[int, int, int]:
    """Parsea #rgb, #rrggbb o #rrggbbaa a (r, g, b). Lanza ValueError si inválido."""
    v = value.lstrip("#")
    if len(v) == 3:
        return tuple(int(c * 2, 16) for c in v)  # type: ignore[return-value]
    if len(v) in (6, 8):
        return int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16)
    raise ValueError(f"Hex inválido: {value}")


def _parse_named(name: str) -> tuple[int, int, int] | None:
    try:
        hex_val = webcolors.name_to_hex(name.lower())
        return _parse_hex(hex_val)
    except (ValueError, AttributeError):
        return None


def _parse_rgb_function(func: Any) -> tuple[int, int, int] | None:
    """Parsea un FunctionBlock de tinycss2 con nombre rgb o rgba."""
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
    """Extrae el primer color reconocido de una lista de tokens CSS."""
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
# WCAG contrast ratio
# ---------------------------------------------------------------------------

def _linearize(c: int) -> float:
    c_norm = c / 255
    return c_norm / 12.92 if c_norm <= 0.04045 else ((c_norm + 0.055) / 1.055) ** 2.4


def _relative_luminance(r: int, g: int, b: int) -> float:
    return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b)


def _contrast_ratio(rgb1: tuple[int, int, int], rgb2: tuple[int, int, int]) -> float:
    l1 = _relative_luminance(*rgb1)
    l2 = _relative_luminance(*rgb2)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


# ---------------------------------------------------------------------------
# Context snippet
# ---------------------------------------------------------------------------

def _build_context_snippet(source_lines: list[str], line_number: int) -> str:
    """Retorna las 3 líneas de contexto alrededor de line_number (1-based)."""
    idx = line_number - 1
    start = max(0, idx - 1)
    end = min(len(source_lines), idx + 2)
    return "\n".join(source_lines[start:end])


# ---------------------------------------------------------------------------
# Main rule
# ---------------------------------------------------------------------------

def detect_contrast_findings(css_content: str) -> list[dict[str, Any]]:
    if not css_content or not str(css_content).strip():
        return []

    source_lines = css_content.splitlines()
    findings: list[dict[str, Any]] = []

    rules = tinycss2.parse_stylesheet(css_content, skip_whitespace=True, skip_comments=True)

    for rule in rules:
        if rule.type != "qualified-rule":
            continue

        declarations = tinycss2.parse_declaration_list(
            rule.content, skip_whitespace=True, skip_comments=True
        )

        foreground: tuple[int, int, int] | None = None
        bg_explicit: tuple[int, int, int] | None = None   # background-color
        bg_shorthand: tuple[int, int, int] | None = None  # background shorthand

        for decl in declarations:
            if decl.type != "declaration":
                continue
            name = decl.lower_name
            if name == "color":
                foreground = _extract_color(decl.value)
            elif name == "background-color":
                bg_explicit = _extract_color(decl.value)
            elif name == "background":
                bg_shorthand = _extract_color(decl.value)

        # background-color tiene prioridad sobre el shorthand
        background = bg_explicit if bg_explicit is not None else bg_shorthand

        if foreground is None or background is None:
            continue

        ratio = _contrast_ratio(foreground, background)
        if ratio >= CONTRAST_THRESHOLD:
            continue

        selector = "".join(t.serialize() for t in rule.prelude).strip()
        line_num = max(1, rule.source_line)

        findings.append({
            "severity": "critical",
            "wcag_rule": CONTRAST_RULE_CODE,
            "message": (
                f'Contraste insuficiente en "{selector}": '
                f"ratio {ratio:.2f}:1 (mínimo requerido {CONTRAST_THRESHOLD}:1)."
            ),
            "line_number": line_num,
            "code_snippet": _build_context_snippet(source_lines, line_num),
            "category": "color-contrast",
        })

    return findings
