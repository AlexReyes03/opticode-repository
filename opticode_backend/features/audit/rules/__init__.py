# ── Reglas HTML — Nivel A ──────────────────────────────────────────────────
from .images    import detect_image_alt_findings              # 1.1.1
from .forms     import (
    detect_form_label_findings,                               # 1.3.1
    detect_error_identification_findings,                     # 3.3.1
)
from .keyboard  import (
    detect_meaningful_sequence_findings,                      # 1.3.2
    detect_keyboard_access_findings,                          # 2.1.1
    detect_focus_order_findings,                              # 2.4.3
)
from .media     import (
    detect_audio_control_findings,                            # 1.4.2
    detect_pause_stop_hide_findings,                          # 2.2.2
)
from .structure import (
    detect_bypass_blocks_findings,                            # 2.4.1
    detect_page_title_findings,                               # 2.4.2
    detect_page_language_findings,                            # 3.1.1
)
from .links     import detect_link_purpose_findings           # 2.4.4
from .aria      import (
    detect_name_role_value_findings,                          # 4.1.2
    detect_label_in_name_findings,                            # 2.5.3
)

# ── Reglas HTML — Nivel AA ─────────────────────────────────────────────────
from .headings  import detect_heading_structure_findings      # 2.4.6

# ── Reglas CSS — Nivel AA ──────────────────────────────────────────────────
from .contrast  import detect_contrast_findings               # 1.4.3

# ---------------------------------------------------------------------------
# Registro de reglas por tipo de archivo
#
# El motor (engine.py) selecciona la lista según uploaded_file.file_type.
# Orden dentro de cada lista: Nivel A → AA → AAA.
# ---------------------------------------------------------------------------

HTML_RULES = [
    # ── Nivel A ──────────────────────────────────────────────────────────
    detect_image_alt_findings,              # 1.1.1 — <img> sin alt
    detect_form_label_findings,             # 1.3.1 — inputs sin label
    detect_meaningful_sequence_findings,    # 1.3.2 — tabindex="-1" en interactivos
    detect_audio_control_findings,          # 1.4.2 — <audio autoplay> sin controls
    detect_keyboard_access_findings,        # 2.1.1 — div/span onclick sin teclado
    detect_pause_stop_hide_findings,        # 2.2.2 — marquee, blink, video autoplay
    detect_bypass_blocks_findings,          # 2.4.1 — sin skip link ni landmarks
    detect_page_title_findings,             # 2.4.2 — <title> ausente o vacío
    detect_focus_order_findings,            # 2.4.3 — tabindex positivos
    detect_link_purpose_findings,           # 2.4.4 — enlaces con texto genérico
    detect_label_in_name_findings,          # 2.5.3 — aria-label no contiene texto visible
    detect_page_language_findings,          # 3.1.1 — <html> sin lang
    detect_error_identification_findings,   # 3.3.1 — form required sin error accesible
    detect_name_role_value_findings,        # 4.1.2 — botones sin nombre / roles inválidos
    # ── Nivel AA ─────────────────────────────────────────────────────────
    detect_heading_structure_findings,      # 2.4.6 — jerarquía de encabezados
]

CSS_RULES = [
    # ── Nivel AA ─────────────────────────────────────────────────────────
    detect_contrast_findings,               # 1.4.3 — contraste mínimo 4.5:1
]
