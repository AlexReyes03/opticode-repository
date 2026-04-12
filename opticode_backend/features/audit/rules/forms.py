"""
Reglas de formularios y campos de entrada.

Criterios cubiertos:
- WCAG 1.3.1 — Info and Relationships · Nivel A
- WCAG 3.3.1 — Error Identification · Nivel A
"""

from __future__ import annotations

from typing import Any

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


# ---------------------------------------------------------------------------
# WCAG 1.3.1 — Info and Relationships · Nivel A
# ---------------------------------------------------------------------------

_LABEL_RULE_CODE  = "WCAG 1.3.1"
_LABEL_WCAG_LEVEL = "A"
_LABEL_SEVERITY   = "error"

# Tipos de <input> que no representan campos de entrada del usuario
EXCLUDED_INPUT_TYPES = {"button", "submit", "reset", "image", "hidden"}


def _input_has_accessible_label(tag: Any, soup: Any) -> bool:
    """
    Verifica si un <input> tiene etiqueta accesible por cualquier mecanismo:
    1. aria-label directo.
    2. aria-labelledby apuntando a otro elemento.
    3. title (fallback reconocido por lectores de pantalla).
    4. <label> envolvente (wrapping label).
    5. <label for="id"> vinculado por el atributo id del input.
    """
    if tag.get("aria-label", "").strip():
        return True
    if tag.get("aria-labelledby", "").strip():
        return True
    if tag.get("title", "").strip():
        return True
    if tag.find_parent("label"):
        return True
    input_id = tag.get("id", "").strip()
    if input_id and soup.find("label", attrs={"for": input_id}):
        return True
    return False


def detect_form_label_findings(html_content: str) -> list[WcagFinding]:
    """Detecta <input> sin mecanismo de etiqueta accesible."""
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all("input"):
        input_type = str(tag.get("type", "text")).lower()
        if input_type in EXCLUDED_INPUT_TYPES:
            continue
        if not _input_has_accessible_label(tag, soup):
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_LABEL_RULE_CODE,
                wcag_level=_LABEL_WCAG_LEVEL,
                severity=_LABEL_SEVERITY,
                message=(
                    f'El <input type="{input_type}"> no tiene un <label> vinculado '
                    "(por id o envolvente) ni atributo de accesibilidad "
                    "(aria-label, aria-labelledby, title)."
                ),
                category="form-input-label",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 3.3.1 — Error Identification · Nivel A
# ---------------------------------------------------------------------------

_ERROR_RULE_CODE  = "WCAG 3.3.1"
_ERROR_WCAG_LEVEL = "A"
_ERROR_SEVERITY   = "warning"

_REQUIRED_FIELD_TAGS = {"input", "select", "textarea"}


def _form_has_error_container(form: Any) -> bool:
    """
    Verifica si el formulario contiene algún mecanismo accesible de error:
    - Elemento con role="alert" o role="status".
    - Elemento con aria-live.
    - Algún campo con aria-describedby (referencia a mensaje de error).
    """
    if form.find(attrs={"role": lambda r: r in ("alert", "status")}):
        return True
    if form.find(attrs={"aria-live": True}):
        return True
    if form.find(attrs={"aria-describedby": True}):
        return True
    return False


def detect_error_identification_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta <form> con campos required sin contenedor de errores accesible.

    Un formulario que marca campos como obligatorios pero no expone los
    mensajes de error a tecnologías asistivas (role="alert", aria-live,
    aria-describedby) impide que usuarios de lector de pantalla identifiquen
    los errores de validación.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for form in soup.find_all("form"):
        has_required = any(
            tag.get("required") is not None or
            str(tag.get("aria-required", "")).lower() == "true"
            for tag in form.find_all(_REQUIRED_FIELD_TAGS)
        )

        if has_required and not _form_has_error_container(form):
            findings.append(make_finding(
                tag=form,
                source_lines=source_lines,
                wcag_rule=_ERROR_RULE_CODE,
                wcag_level=_ERROR_WCAG_LEVEL,
                severity=_ERROR_SEVERITY,
                message=(
                    "<form> con campos required sin contenedor de errores accesible. "
                    "Añade role=\"alert\" o aria-live en el área de mensajes de error, "
                    "o vincula cada campo a su mensaje con aria-describedby."
                ),
                category="form-error-identification",
            ))

    return findings
