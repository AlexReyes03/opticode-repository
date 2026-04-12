"""
Reglas de atributos ARIA y semántica de roles.

Criterios cubiertos:
- WCAG 4.1.2 — Name, Role, Value · Nivel A
- WCAG 2.5.3 — Label in Name · Nivel A
- WCAG 4.1.3 — Status Messages · Nivel AA
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


# Roles ARIA 1.2 válidos (W3C)
VALID_ARIA_ROLES = {
    "alert", "alertdialog", "application", "article", "banner", "button",
    "cell", "checkbox", "columnheader", "combobox", "complementary",
    "contentinfo", "definition", "dialog", "directory", "document", "feed",
    "figure", "form", "grid", "gridcell", "group", "heading", "img", "link",
    "list", "listbox", "listitem", "log", "main", "marquee", "math", "menu",
    "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "navigation",
    "none", "note", "option", "presentation", "progressbar", "radio",
    "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar",
    "search", "searchbox", "separator", "slider", "spinbutton", "status",
    "switch", "tab", "table", "tablist", "tabpanel", "term", "textbox",
    "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem",
}

# Roles que convierten un elemento en un live region accesible
_LIVE_REGION_ROLES = {"alert", "status", "log", "marquee", "timer"}


# ---------------------------------------------------------------------------
# WCAG 4.1.2 — Name, Role, Value · Nivel A
# ---------------------------------------------------------------------------

_NRV_RULE_CODE  = "WCAG 4.1.2"
_NRV_WCAG_LEVEL = "A"
_NRV_SEVERITY   = "error"


def _has_accessible_name(tag) -> bool:
    """Verifica si un elemento tiene nombre accesible por cualquier mecanismo."""
    if tag.get("aria-label", "").strip():
        return True
    if tag.get("aria-labelledby", "").strip():
        return True
    if tag.get("title", "").strip():
        return True
    if tag.get_text(strip=True):
        return True
    return False


def detect_name_role_value_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta:
    - <button> sin nombre accesible.
    - Elementos con role ARIA inválido según WAI-ARIA 1.2.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all("button"):
        if not _has_accessible_name(tag):
            findings.append(make_finding(
                tag=tag, source_lines=source_lines,
                wcag_rule=_NRV_RULE_CODE, wcag_level=_NRV_WCAG_LEVEL,
                severity=_NRV_SEVERITY,
                message="<button> sin nombre accesible. Añade texto visible, aria-label o aria-labelledby.",
                category="button-missing-name",
            ))

    for tag in soup.find_all(attrs={"role": True}):
        role_value = str(tag.get("role", "")).strip().lower()
        if role_value and role_value not in VALID_ARIA_ROLES:
            findings.append(make_finding(
                tag=tag, source_lines=source_lines,
                wcag_rule=_NRV_RULE_CODE, wcag_level=_NRV_WCAG_LEVEL,
                severity=_NRV_SEVERITY,
                message=(
                    f'role="{role_value}" no es un rol ARIA válido. '
                    "Consulta la especificación WAI-ARIA 1.2."
                ),
                category="aria-invalid-role",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 2.5.3 — Label in Name · Nivel A
# ---------------------------------------------------------------------------

_LIN_RULE_CODE  = "WCAG 2.5.3"
_LIN_WCAG_LEVEL = "A"
_LIN_SEVERITY   = "warning"

_LABELED_TAGS = ["a", "button", "input", "select", "textarea", "label"]


def detect_label_in_name_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta elementos con texto visible y aria-label donde aria-label NO
    contiene el texto visible.

    Los usuarios de control por voz activan controles pronunciando su texto
    visible; si aria-label difiere, el comando no funcionará.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all(_LABELED_TAGS, attrs={"aria-label": True}):
        aria_label  = str(tag.get("aria-label", "")).strip().lower()
        visible_text = tag.get_text(strip=True).lower()

        if not visible_text or not aria_label:
            continue

        if visible_text not in aria_label:
            findings.append(make_finding(
                tag=tag, source_lines=source_lines,
                wcag_rule=_LIN_RULE_CODE, wcag_level=_LIN_WCAG_LEVEL,
                severity=_LIN_SEVERITY,
                message=(
                    f'aria-label="{tag.get("aria-label")}" no contiene el texto visible '
                    f'"{tag.get_text(strip=True)}". '
                    "Los usuarios de control por voz no podrán activar este control."
                ),
                category="label-not-in-name",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 4.1.3 — Status Messages · Nivel AA
# ---------------------------------------------------------------------------

_STATUS_RULE_CODE  = "WCAG 4.1.3"
_STATUS_WCAG_LEVEL = "AA"
_STATUS_SEVERITY   = "warning"

# Palabras clave en nombres de clase que sugieren un contenedor de estado
_STATUS_CLASS_KEYWORDS = {
    "alert", "notification", "toast", "message", "success", "error",
    "warning", "info", "feedback", "alerta", "notificacion", "mensaje",
    "exito", "advertencia", "aviso",
}


def detect_status_messages_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta elementos con clases que sugieren contenido de estado/notificación
    pero sin role de live region ni aria-live.

    Sin estos atributos, los mensajes dinámicos (errores, confirmaciones,
    notificaciones) no se anuncian a usuarios de lector de pantalla.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all(["div", "section", "aside", "span", "p"]):
        classes = tag.get("class") or []
        classes_str = " ".join(str(c) for c in classes).lower()

        if not any(kw in classes_str for kw in _STATUS_CLASS_KEYWORDS):
            continue

        role = str(tag.get("role", "")).strip().lower()
        has_aria_live = tag.get("aria-live") is not None

        if role not in _LIVE_REGION_ROLES and not has_aria_live:
            findings.append(make_finding(
                tag=tag, source_lines=source_lines,
                wcag_rule=_STATUS_RULE_CODE, wcag_level=_STATUS_WCAG_LEVEL,
                severity=_STATUS_SEVERITY,
                message=(
                    f'Elemento con clase "{tag.get("class")}" parece un contenedor '
                    "de mensajes de estado pero no tiene role=\"alert\", "
                    'role="status" ni aria-live. '
                    "Los lectores de pantalla no anunciarán sus cambios."
                ),
                category="status-message-not-accessible",
            ))

    return findings
