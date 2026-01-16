from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_email(template_name, subject, context, recipient_email, from_email=settings.EMAIL_HOST_MAIL, reply_to=None):
    try:
        if not isinstance(recipient_email, list):
            recipient_email = [recipient_email]

        print("recipient email", recipient_email)
        context['mailto'] = settings.CONTACT_EMAIL
        html_message = render_to_string(template_name, context)
        plain_message = strip_tags(html_message)
        
        # EmailMultiAlternativesを使用してReply-Toを設定
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=from_email,
            to=recipient_email,
            reply_to=[reply_to] if reply_to else None  # Reply-Toヘッダー
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        
        print(f"Email sent to {recipient_email} using {template_name}")
        if reply_to:
            print(f"Reply-To set to: {reply_to}")
    except Exception as e:
        print(f"Failed to send email to {recipient_email}: {e}")
