import asyncio
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .config import settings


def _send_smtp(to: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(msg["From"], [to], msg.as_string())


async def send_password_reset_email(to: str, reset_url: str) -> None:
    if not settings.smtp_host or not settings.smtp_user:
        return
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#06100f;color:#eef3ee;padding:48px 24px;margin:0;">
  <div style="max-width:480px;margin:0 auto;">
    <div style="font-size:22px;font-weight:600;margin-bottom:32px;color:#eef3ee;letter-spacing:0.02em;">
      Ziyafat
    </div>
    <h1 style="font-size:28px;font-weight:500;margin:0 0 12px;color:#eef3ee;">Reset your password</h1>
    <p style="font-size:15px;color:#9bb1a5;margin:0 0 28px;line-height:1.6;">
      We received a request to reset your password. Click the button below — this link expires in 30 minutes.
    </p>
    <a href="{reset_url}"
       style="display:inline-block;padding:14px 28px;background:linear-gradient(180deg,#e6cf9c,#caa463);
              color:#241b07;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;">
      Reset password
    </a>
    <p style="font-size:13px;color:#9bb1a5;margin:28px 0 0;line-height:1.6;">
      If you didn't request this, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.09);margin:32px 0;" />
    <p style="font-size:12px;color:#9bb1a5;margin:0;">
      Can't click the button? Copy this link:<br/>
      <span style="color:#74d6cf;word-break:break-all;">{reset_url}</span>
    </p>
  </div>
</body>
</html>"""
    await asyncio.to_thread(_send_smtp, to, "Reset your Ziyafat password", html)
