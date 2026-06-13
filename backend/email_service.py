import os
import smtplib

from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()


def send_verification_email(
    email: str,
    verification_link: str
):

    sender_email = os.getenv(
        "EMAIL_ADDRESS"
    )

    sender_password = os.getenv(
        "EMAIL_PASSWORD"
    )

    subject = (
        "Verify your MatchX Newsletter Subscription"
    )

    body = f"""
Thank you for subscribing to MatchX Intelligence.

Click the link below to verify your subscription:

{verification_link}
"""

    msg = MIMEText(body)

    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email

    try:

        with smtplib.SMTP(
            "smtp.gmail.com",
            587
        ) as server:

            server.starttls()

            server.login(
                sender_email,
                sender_password
            )

            server.send_message(msg)

        print(
            f"Verification email sent to {email}"
        )

        return True

    except Exception as e:

        print(
            f"Email Error: {e}"
        )

        return False