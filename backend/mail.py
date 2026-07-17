import os
import re
import logging
import requests
import threading
from datetime import datetime, timezone
from typing import Dict, Any, Optional

logger = logging.getLogger("fitforge.mail")

# Default Resend parameters from environment
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "FitForge <noreply@yourdomain.com>")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO", "support@yourdomain.com")

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")

# Track Resend mail status for diagnostic panel
_last_send_status = "Not sent yet"

def get_last_send_status() -> str:
    return _last_send_status

def verify_resend_connection() -> tuple:
    """Check connection/api key validity with Resend."""
    if not RESEND_API_KEY:
        return False, "Resend API Key is not configured in .env variables."
    try:
        response = requests.get(
            "https://api.resend.com/domains",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            timeout=5
        )
        if response.status_code == 200:
            return True, "Resend API connection and API key verified successfully"
        else:
            return False, f"Resend API returned status code {response.status_code}: {response.text}"
    except Exception as e:
        return False, f"Resend connection failed: {str(e)}"

# ---------- Email Reusable Components ----------

def email_header() -> str:
    return """
    <div style="background-color: #0B0B0B; border-bottom: 2px solid #FF5A1F; padding: 25px; text-align: center;">
      <span style="font-family: 'Bebas Neue', Arial, sans-serif; font-size: 28px; letter-spacing: 2px; color: #FFFFFF; font-weight: bold;">
        FIT<span style="color: #FF5A1F;">FORGE</span>
      </span>
      <div style="color: #8A8A8A; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 3px;">Stronger Every Day</div>
    </div>
    """

def email_footer() -> str:
    return """
    <div style="background-color: #0f0f0f; border-top: 1px solid #2A2A2A; padding: 30px; text-align: center; font-size: 12px; color: #8A8A8A;">
      <p style="margin: 0 0 10px 0;">24 Ironworks Avenue, Bengaluru, KA 560001</p>
      <p style="margin: 0 0 15px 0;">Phone: +91 98765 43210 | Email: hello@fitforge.gym</p>
      <div style="margin-top: 15px;">
        <a href="https://instagram.com/fitforge" style="color: #FF5A1F; margin: 0 8px; text-decoration: none;">Instagram</a> |
        <a href="https://facebook.com/fitforge" style="color: #FF5A1F; margin: 0 8px; text-decoration: none;">Facebook</a> |
        <a href="https://twitter.com/fitforge" style="color: #FF5A1F; margin: 0 8px; text-decoration: none;">Twitter</a>
      </div>
      <p style="margin: 20px 0 0 0; font-size: 10px; color: #555555;">© 2026 FitForge Gym. All rights reserved.</p>
    </div>
    """

def email_button(label: str, url: str) -> str:
    return f"""
    <a href="{url}" target="_blank" style="background-color: #FF5A1F; color: #FFFFFF; font-family: sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 15px 30px; display: inline-block; border-radius: 0; box-shadow: 0 4px 10px rgba(255, 90, 31, 0.25);">
      {label}
    </a>
    """

def email_divider() -> str:
    return '<hr style="border: 0; border-top: 1px solid #2A2A2A; margin: 25px 0;">'

def email_callout(text: str, title: Optional[str] = None) -> str:
    title_html = f'<strong style="color: #FFFFFF; display: block; margin-bottom: 5px; font-size: 14px;">{title}</strong>' if title else ""
    return f"""
    <div style="background-color: #0b0b0b; border-left: 3px solid #FF5A1F; padding: 15px 20px; margin: 20px 0; color: #8A8A8A; font-size: 13.5px; line-height: 1.5;">
      {title_html}
      {text}
    </div>
    """

def html_to_text(html: str) -> str:
    """Rough text converter stripping HTML tags."""
    # Replace line breaks and paragraph tags with newlines
    text = re.sub(r'(?i)<br\s*\/?>', '\n', html)
    text = re.sub(r'(?i)<\/p>', '\n\n', text)
    text = re.sub(r'(?i)<\/h[1-6]>', '\n\n', text)
    # Strip all other HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode basic HTML entities
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return text.strip()

# ---------- Templates compilation and sending ----------

def compile_template(template_name: str, context: Dict[str, Any]) -> str:
    """Load, componentize, and compile HTML email template."""
    # 1. Read layout file
    layout_path = os.path.join(TEMPLATE_DIR, "layout.html")
    with open(layout_path, "r", encoding="utf-8") as f:
        layout = f.read()
        
    # 2. Read template file
    template_path = os.path.join(TEMPLATE_DIR, f"{template_name}.html")
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    # Add components default layout variables in context if not explicitly provided
    if "callout" not in context:
        context["callout"] = ""
        
    # Check status if reservation confirm/reject
    if "status" in context:
        status = context["status"]
        context["status_color"] = "#3DDC84" if status == "approved" else "#FF5A1F" if status == "pending" else "#FF3B30"
        if status == "approved":
            context["callout"] = email_callout("Your request is approved! We look forward to seeing you. Please show up 10 minutes prior to warm up.", "Slot Confirmed")
            context["action_button"] = email_button("View Class Schedule", "http://localhost:3000/#schedule")
        elif status == "pending":
            context["callout"] = email_callout("Your booking is pending coach review. We'll update you as soon as the trainer confirms the slot.", "Under Review")
            context["action_button"] = email_button("Browse Services", "http://localhost:3000/#services")

    if "booking_details" not in context and "date" in context and "time_slot" in context:
        details_text = f"Trainer: {context.get('trainer_name', 'Trainer')}<br>Date: {context['date']}<br>Time: {context['time_slot']}"
        context["booking_details"] = email_callout(details_text, "Session Info")
        
    if "action_button" not in context:
        context["action_button"] = email_button("Visit Website", "http://localhost:3000/")

    # Inject layout components
    layout = layout.replace("{{ header }}", email_header())
    layout = layout.replace("{{ footer }}", email_footer())
    
    # Process variables inside template
    rendered_template = template
    for key, val in context.items():
        placeholder = "{{" + f" {key} " + "}}"
        placeholder_no_space = "{{" + key + "}}"
        rendered_template = rendered_template.replace(placeholder, str(val)).replace(placeholder_no_space, str(val))
        
    # Inject compiled content into layout
    final_html = layout.replace("{{ content }}", rendered_template)
    return final_html

def send_email_sync(to_email: str, template_name: str, context: Dict[str, Any], subject: Optional[str] = None):
    """Synchronously send compiled template via Resend."""
    global _last_send_status
    subject_map = {
        "reservation": "FitForge Gym — Session Booking Confirmation",
        "cancelled": "FitForge Gym — Session Reservation Cancelled",
        "contact": "FitForge Gym — Message Received",
        "enquiry": "FitForge Gym — Membership Enquiry Received",
        "newsletter": "Welcome to the FitForge Bulletin!",
        "admin_notification": "FitForge Admin Alert",
    }
    
    email_subject = subject or subject_map.get(template_name, "FitForge Gym Update")
    
    try:
        html_content = compile_template(template_name, context)
        text_content = html_to_text(html_content)
        
        # If Resend is not configured in variables, fall back to console logging
        if not RESEND_API_KEY:
            logger.info("================== EMAIL DISPATCH LOG (RESEND OFF) ==================")
            logger.info(f"TO: {to_email}")
            logger.info(f"SUBJECT: {email_subject}")
            logger.info(f"TEXT FALLBACK:\n{text_content}\n")
            logger.info("===================================================================")
            _last_send_status = f"Local Mock OK: Simulated send to {to_email} at {datetime.now(timezone.utc).strftime('%H:%M:%S')}"
            return True
            
        payload = {
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": email_subject,
            "html": html_content,
            "text": text_content,
        }
        if EMAIL_REPLY_TO:
            payload["reply_to"] = EMAIL_REPLY_TO

        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        
        if response.status_code in (200, 201, 202):
            logger.info(f"Email sent successfully via Resend to {to_email}")
            _last_send_status = f"Success: Sent to {to_email} at {datetime.now(timezone.utc).strftime('%H:%M:%S')}"
            return True
        else:
            logger.error(f"Failed to send email via Resend: Status {response.status_code}, Response: {response.text}")
            _last_send_status = f"Failed to send: Resend API error {response.status_code} at {datetime.now(timezone.utc).strftime('%H:%M:%S')}"
            return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        _last_send_status = f"Failed to send: {str(e)} at {datetime.now(timezone.utc).strftime('%H:%M:%S')}"
        return False

def send_email_async(to_email: str, template_name: str, context: Dict[str, Any], subject: Optional[str] = None):
    """Fire email send operation asynchronously in a background thread."""
    thread = threading.Thread(
        target=send_email_sync,
        args=(to_email, template_name, context, subject),
        daemon=True
    )
    thread.start()
