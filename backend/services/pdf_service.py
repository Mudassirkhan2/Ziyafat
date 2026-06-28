import os
from jinja2 import Environment, FileSystemLoader

_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
_env = Environment(loader=FileSystemLoader(_TEMPLATES_DIR), autoescape=True)


_WEASYPRINT_UNAVAILABLE = False


class WeasyPrintUnavailableError(Exception):
    def __init__(self, html: str):
        self.html = html


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

    raise WeasyPrintUnavailableError(html_string)
