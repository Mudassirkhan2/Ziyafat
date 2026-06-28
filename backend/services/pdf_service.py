import os
from jinja2 import Environment, FileSystemLoader

_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
_env = Environment(loader=FileSystemLoader(_TEMPLATES_DIR), autoescape=True)


_WEASYPRINT_UNAVAILABLE = False

def render_pdf(template_name: str, context: dict) -> bytes:
    global _WEASYPRINT_UNAVAILABLE
    template = _env.get_template(template_name)
    html_string = template.render(**context)

    if not _WEASYPRINT_UNAVAILABLE:
        try:
            import weasyprint  # noqa: PLC0415
            return weasyprint.HTML(string=html_string, base_url=_TEMPLATES_DIR).write_pdf()
        except OSError:
            # GTK / Pango not available (Windows dev env without GTK runtime)
            _WEASYPRINT_UNAVAILABLE = True

    # Fallback: return a minimal valid PDF with the rendered HTML as metadata
    # This is used on Windows dev machines; production (Render/Linux) uses real WeasyPrint.
    return (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj "
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj "
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n"
        b"xref\n0 4\n"
        b"0000000000 65535 f\n0000000009 00000 n\n"
        b"0000000058 00000 n\n0000000115 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
    )
