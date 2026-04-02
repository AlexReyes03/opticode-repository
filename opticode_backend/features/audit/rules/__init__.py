from .headings import detect_heading_structure_findings
from .forms import detect_form_label_findings

HTML_RULES = [
    detect_heading_structure_findings,
    detect_form_label_findings,
]

CSS_RULES = []
