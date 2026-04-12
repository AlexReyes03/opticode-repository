# ── Reglas HTML — Nivel A ──────────────────────────────────────────────────
from .images    import detect_image_alt_findings              # 1.1.1
from .forms     import (
    detect_form_label_findings,                               # 1.3.1
    detect_error_identification_findings,                     # 3.3.1
    detect_input_purpose_findings,                            # 1.3.5 (AA)
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
    detect_reflow_findings,                                   # 1.4.10 (AA)
    detect_section_headings_findings,                         # 2.4.10 (AAA)
    detect_identify_purpose_findings,                         # 1.3.6 (AAA)
)
from .links     import (
    detect_link_purpose_findings,                             # 2.4.4
    detect_link_purpose_strict_findings,                      # 2.4.9 (AAA)
)
from .aria      import (
    detect_name_role_value_findings,                          # 4.1.2
    detect_label_in_name_findings,                            # 2.5.3
    detect_status_messages_findings,                          # 4.1.3 (AA)
)

# ── Reglas HTML — Nivel AA ─────────────────────────────────────────────────
from .headings  import detect_heading_structure_findings      # 2.4.6

# ── Reglas HTML — Nivel AAA ────────────────────────────────────────────────
from .text import (
    detect_unusual_words_findings,                            # 3.1.3
    detect_abbreviations_findings,                            # 3.1.4
    detect_reading_level_findings,                            # 3.1.5
    detect_pronunciation_findings,                            # 3.1.6
)

# ── Reglas CSS — Nivel AA ──────────────────────────────────────────────────
from .contrast   import (
    detect_contrast_findings,                                 # 1.4.3
    detect_nontext_contrast_findings,                         # 1.4.11
)
from .css_checks import (
    detect_focus_visible_findings,                            # 2.4.7
    detect_resize_text_findings,                              # 1.4.4
    detect_text_spacing_findings,                             # 1.4.12
    detect_orientation_lock_findings,                         # 1.3.4
    detect_target_size_findings,                              # 2.5.8
)

# ── Reglas CSS — Nivel AAA ─────────────────────────────────────────────────
from .contrast   import detect_contrast_enhanced_findings     # 1.4.6
from .css_checks import (
    detect_visual_presentation_findings,                      # 1.4.8
    detect_animation_findings,                                # 2.3.3
    detect_focus_appearance_findings,                         # 2.4.13
    detect_target_size_enhanced_findings,                     # 2.5.5
)

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
    detect_reflow_findings,                 # 1.4.10 — viewport zoom desactivado
    detect_input_purpose_findings,          # 1.3.5 — input sin autocomplete
    detect_heading_structure_findings,      # 2.4.6 — jerarquía de encabezados
    detect_status_messages_findings,        # 4.1.3 — mensajes de estado sin live region
    # ── Nivel AAA ────────────────────────────────────────────────────────
    detect_link_purpose_strict_findings,    # 2.4.9 — enlace sin nombre accesible
    detect_section_headings_findings,       # 2.4.10 — section/article sin encabezado
    detect_identify_purpose_findings,       # 1.3.6 — sin landmarks semánticos
    detect_unusual_words_findings,          # 3.1.3 — sin mecanismo de definición
    detect_abbreviations_findings,          # 3.1.4 — siglas sin <abbr title>
    detect_reading_level_findings,          # 3.1.5 — nivel de lectura elevado
    detect_pronunciation_findings,          # 3.1.6 — palabras ambiguas sin <ruby>
]

CSS_RULES = [
    # ── Nivel AA ─────────────────────────────────────────────────────────
    detect_contrast_findings,               # 1.4.3 — contraste texto 4.5:1
    detect_nontext_contrast_findings,       # 1.4.11 — contraste borde UI 3:1
    detect_focus_visible_findings,          # 2.4.7 — outline:none en :focus
    detect_resize_text_findings,            # 1.4.4 — font-size en px fijo
    detect_text_spacing_findings,           # 1.4.12 — espaciado con !important
    detect_orientation_lock_findings,       # 1.3.4 — bloqueo de orientación
    detect_target_size_findings,            # 2.5.8 — área de toque < 24px
    # ── Nivel AAA ────────────────────────────────────────────────────────
    detect_contrast_enhanced_findings,      # 1.4.6 — contraste texto 7:1
    detect_visual_presentation_findings,    # 1.4.8 — line-height, justify, max-width
    detect_animation_findings,              # 2.3.3 — animaciones sin reduced-motion
    detect_focus_appearance_findings,       # 2.4.13 — foco sin offset ni shadow
    detect_target_size_enhanced_findings,   # 2.5.5 — área de toque < 44px
]
