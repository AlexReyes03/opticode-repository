from __future__ import annotations

from typing import Any

from bs4 import BeautifulSoup


FORMS_RULE_CODE = "WCAG 1.3.1"

# Tipos de <input> que no representan campos de entrada del usuario y no requieren label
EXCLUDED_INPUT_TYPES = {"button", "submit", "reset", "image", "hidden"}


def _line_number(tag: Any) -> int:
    line_number = getattr(tag, "sourceline", None)
    try:
        return max(1, int(line_number))
    except (TypeError, ValueError):
        return 1


def _build_context_snippet(source_lines: list[str], line_number: int) -> str:
    """Retorna las 3 líneas de contexto alrededor de line_number (1-based), separadas por \\n."""
    idx = line_number - 1
    start = max(0, idx - 1)
    end = min(len(source_lines), idx + 2)
    return "\n".join(source_lines[start:end])


def _build_finding(
    *,
    tag: Any,
    message: str,
    category: str,
    source_lines: list[str],
) -> dict[str, Any]:
    line_num = _line_number(tag)
    return {
        "severity": "critical",
        "wcag_level": "A",
        "wcag_rule": FORMS_RULE_CODE,
        "message": message,
        "line_number": line_num,
        "code_snippet": _build_context_snippet(source_lines, line_num),
        "category": category,
    }


def _input_has_accessible_label(tag: Any, soup: Any) -> bool:
    """
    Verifica si un <input> tiene una etiqueta accesible por cualquier mecanismo válido:
      1. aria-label directo en el elemento.
      2. aria-labelledby que referencia otro elemento.
      3. title (fallback accesible reconocido por lectores de pantalla).
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


def detect_form_label_findings(html_content: str) -> list[dict[str, Any]]:
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[dict[str, Any]] = []

    for tag in soup.find_all("input"):
        input_type = str(tag.get("type", "text")).lower()
        if input_type in EXCLUDED_INPUT_TYPES:
            continue

        if not _input_has_accessible_label(tag, soup):
            findings.append(
                _build_finding(
                    tag=tag,
                    category="form-input-label",
                    message=(
                        f'El <input type="{input_type}"> no tiene un <label> vinculado '
                        "(por id o envolvente) ni atributo de accesibilidad "
                        "(aria-label, aria-labelledby, title)."
                    ),
                    source_lines=source_lines,
                )
            )

    return findings
