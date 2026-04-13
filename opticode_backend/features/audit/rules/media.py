"""
Reglas relacionadas con elementos multimedia.

Criterios cubiertos:
- WCAG 1.4.2 — Audio Control · Nivel A
- WCAG 2.2.2 — Pause, Stop, Hide · Nivel A
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from ._utils import WcagFinding, make_finding


# ---------------------------------------------------------------------------
# WCAG 1.4.2 — Audio Control · Nivel A
# ---------------------------------------------------------------------------

_AUDIO_RULE_CODE  = "WCAG 1.4.2"
_AUDIO_WCAG_LEVEL = "A"
_AUDIO_SEVERITY   = "error"


def detect_audio_control_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta <audio autoplay> sin atributo controls.

    Sin controls el usuario no tiene mecanismo visible para pausar o detener
    el audio, bloqueando a personas con discapacidad cognitiva, auditiva o
    que usen lector de pantalla.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all("audio"):
        if tag.get("autoplay") is not None and tag.get("controls") is None:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_AUDIO_RULE_CODE,
                wcag_level=_AUDIO_WCAG_LEVEL,
                severity=_AUDIO_SEVERITY,
                message=(
                    "<audio autoplay> sin atributo controls. "
                    "El usuario no puede pausar ni detener el audio. "
                    "Añade controls o elimina autoplay."
                ),
                category="audio-autoplay-no-controls",
            ))

    return findings


# ---------------------------------------------------------------------------
# WCAG 2.2.2 — Pause, Stop, Hide · Nivel A
# ---------------------------------------------------------------------------

_PSH_RULE_CODE  = "WCAG 2.2.2"
_PSH_WCAG_LEVEL = "A"
_PSH_SEVERITY   = "error"


def detect_pause_stop_hide_findings(html_content: str) -> list[WcagFinding]:
    """
    Detecta contenido en movimiento sin mecanismo de control:

    - <marquee>: elemento obsoleto que desplaza texto sin posibilidad de pausa.
    - <blink>: elemento obsoleto que parpadea texto de forma continua.
    - <video autoplay> sin controls: video que inicia sin permitir al usuario detenerlo.
    """
    if not html_content or not str(html_content).strip():
        return []

    soup = BeautifulSoup(html_content, "html5lib", store_line_numbers=True)
    source_lines = html_content.splitlines()
    findings: list[WcagFinding] = []

    for tag in soup.find_all("marquee"):
        findings.append(make_finding(
            tag=tag,
            source_lines=source_lines,
            wcag_rule=_PSH_RULE_CODE,
            wcag_level=_PSH_WCAG_LEVEL,
            severity=_PSH_SEVERITY,
            message=(
                "<marquee> desplaza texto de forma continua sin mecanismo de pausa. "
                "Es un elemento obsoleto; reemplázalo con CSS animation controlada."
            ),
            category="marquee-moving-content",
        ))

    for tag in soup.find_all("blink"):
        findings.append(make_finding(
            tag=tag,
            source_lines=source_lines,
            wcag_rule=_PSH_RULE_CODE,
            wcag_level=_PSH_WCAG_LEVEL,
            severity=_PSH_SEVERITY,
            message=(
                "<blink> hace parpadear texto de forma continua. "
                "Es un elemento obsoleto; elimínalo."
            ),
            category="blink-moving-content",
        ))

    for tag in soup.find_all("video"):
        if tag.get("autoplay") is not None and tag.get("controls") is None:
            findings.append(make_finding(
                tag=tag,
                source_lines=source_lines,
                wcag_rule=_PSH_RULE_CODE,
                wcag_level=_PSH_WCAG_LEVEL,
                severity=_PSH_SEVERITY,
                message=(
                    "<video autoplay> sin controls: el usuario no puede pausar "
                    "ni detener el video. Añade el atributo controls."
                ),
                category="video-autoplay-no-controls",
            ))

    return findings
