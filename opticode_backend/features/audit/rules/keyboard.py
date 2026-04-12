"""
Reglas de accesibilidad por teclado y orden de foco.

Criterios cubiertos:
- WCAG 1.3.2 — Meaningful Sequence · Nivel A
- WCAG 2.1.1 — Keyboard · Nivel A
- WCAG 2.4.3 — Focus Order · Nivel A
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


# ---------------------------------------------------------------------------
# WCAG 2.4.3 — Focus Order · Nivel A
# ---------------------------------------------------------------------------

_FOCUS_ORDER_RULE_CODE  = "WCAG 2.4.3"
_FOCUS_ORDER_WCAG_LEVEL = "A"
_FOCUS_ORDER_SEVERITY   = "warning"


def detect_focus_order_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta elementos con tabindex > 0.

    Un valor positivo sobreescribe el orden natural del DOM y es un
    anti-patrón documentado: rompe la secuencia de foco esperada por
    usuarios de teclado y lectores de pantalla.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all(attrs={"tabindex": True}):
        try:
            value = int(str(tag.get("tabindex", "")).strip())
        except (ValueError, TypeError):
            continue

        if value > 0:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_FOCUS_ORDER_RULE_CODE,
                wcag_level=_FOCUS_ORDER_WCAG_LEVEL,
                severity=_FOCUS_ORDER_SEVERITY,
                message=(
                    f'tabindex="{value}" altera el orden natural del foco. '
                    'Usa tabindex="0" para incluir el elemento en el flujo del DOM '
                    'o tabindex="-1" para gestionarlo con JavaScript.'
                ),
                category="tabindex-positive",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 1.3.2 — Meaningful Sequence · Nivel A
# ---------------------------------------------------------------------------

_SEQ_RULE_CODE  = "WCAG 1.3.2"
_SEQ_WCAG_LEVEL = "A"
_SEQ_SEVERITY   = "warning"

# Elementos que son interactivos por naturaleza y deberían estar en el tab order
_NATIVELY_INTERACTIVE = {"a", "button", "input", "select", "textarea", "details", "summary"}


def detect_meaningful_sequence_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta elementos nativa y semánticamente interactivos con tabindex="-1".

    Eliminar del tab order un enlace, botón o campo de formulario rompe la
    secuencia de navegación significativa esperada por usuarios de teclado.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all(_NATIVELY_INTERACTIVE, attrs={"tabindex": True}):
        try:
            value = int(str(tag.get("tabindex", "")).strip())
        except (ValueError, TypeError):
            continue

        if value == -1:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_SEQ_RULE_CODE,
                wcag_level=_SEQ_WCAG_LEVEL,
                severity=_SEQ_SEVERITY,
                message=(
                    f'<{tag.name} tabindex="-1"> queda fuera del flujo de teclado. '
                    "Solo usa tabindex=\"-1\" en elementos gestionados explícitamente "
                    "con JavaScript (e.g. focus() programático)."
                ),
                category="tabindex-negative-interactive",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 2.1.1 — Keyboard · Nivel A
# ---------------------------------------------------------------------------

_KEYBOARD_RULE_CODE  = "WCAG 2.1.1"
_KEYBOARD_WCAG_LEVEL = "A"
_KEYBOARD_SEVERITY   = "error"

# Roles que otorgan semántica interactiva a un elemento no nativo
_INTERACTIVE_ROLES = {
    "button", "link", "menuitem", "menuitemcheckbox", "menuitemradio",
    "option", "tab", "treeitem", "checkbox", "radio", "switch",
}


def detect_keyboard_access_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta <div> y <span> con onclick que no son alcanzables por teclado.

    Un elemento no nativo con onclick pero sin tabindex ni role interactivo
    no puede recibir foco con Tab, haciéndolo inaccesible para usuarios
    que no usan ratón.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all(["div", "span"], attrs={"onclick": True}):
        has_tabindex = tag.get("tabindex") is not None
        role = str(tag.get("role", "")).strip().lower()

        if not has_tabindex and role not in _INTERACTIVE_ROLES:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_KEYBOARD_RULE_CODE,
                wcag_level=_KEYBOARD_WCAG_LEVEL,
                severity=_KEYBOARD_SEVERITY,
                message=(
                    f'<{tag.name}> con onclick no es accesible por teclado. '
                    'Añade tabindex="0" y role="button", o usa un elemento <button> nativo.'
                ),
                category="click-handler-not-keyboard-accessible",
            ))

    return findings
