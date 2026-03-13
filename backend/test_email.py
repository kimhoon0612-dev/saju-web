import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv('.env')

smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
smtp_port = int(os.environ.get("SMTP_PORT", 587))
smtp_username = os.environ.get("SMTP_USERNAME")
smtp_password = os.environ.get("SMTP_PASSWORD")

print(f"SMTP Config: Server={smtp_server}:{smtp_port}, User={smtp_username}")

if not smtp_username or not smtp_password:
    print("Error: SMTP_USERNAME or SMTP_PASSWORD is not set in .env")
    exit(1)

try:
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = smtp_username # Send to self
    msg['Subject'] = "[Test] Email Setup"
    
    body = "이메일 발송 테스트입니다."
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    
    print("Connecting to server...")
    server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
    server.set_debuglevel(1)
    print("Starting TLS...")
    server.starttls()
    print("Logging in...")
    server.login(smtp_username, smtp_password)
    print("Sending email...")
    server.send_message(msg)
    server.quit()
    print("Success!")
except Exception as e:
    print(f"Exception: {e}")
