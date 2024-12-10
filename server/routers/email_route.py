import imaplib
import email
import smtplib
import chardet

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify

email_route = Blueprint('email_route', __name__)


# Example route to read emails
@email_route.route('/', methods=['POST'])
def read_email():
    # Get the email credentials from the request body
    data = request.json
    username = data.get('email')
    password = data.get('password')
    imap_server = data.get('incomingMailServer')

    # Connect to the server
    mail = imaplib.IMAP4_SSL(imap_server)

    # Login to your account
    mail.login(username, password)

    # Select the mailbox you want to read (in this case, the inbox)
    mail.select("inbox")

    # Search for all emails in the inbox
    status, messages = mail.search(None, 'ALL')
    email_ids = messages[0].split()

    email_data = []

    for email_id in email_ids:
        status, msg_data = mail.fetch(email_id, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                email_dict = {
                    "seqno": int(email_id.decode()),
                    "from": msg["from"],
                    "to": msg["to"],
                    "subject": msg["subject"],
                    "date": msg["date"],
                    "body": ""
                }
                for part in msg.walk():
                    print(part.get_content_type())
                    if part.get_content_type() == "text/html":
                        payload = part.get_payload(decode=True)
                        if payload:
                            encoding = chardet.detect(
                                payload)['encoding'] or 'utf-8'
                            email_dict["body"] = payload.decode(
                                encoding, errors='replace')
                            break  # Prioritize HTML content
                    elif part.get_content_type() == "text/plain" and not email_dict["body"]:
                        payload = part.get_payload(decode=True)
                        if payload:
                            encoding = chardet.detect(
                                payload)['encoding'] or 'utf-8'
                            email_dict["body"] = payload.decode(
                                encoding, errors='replace')
                email_data.append(email_dict)

    return jsonify(email_data)


# Route to send an email
@email_route.route('/send', methods=['POST'])
def send_email():
    data = request.json
    to_email = data.get('to')
    subject = data.get('subject')
    body = data.get('text')

    # Get the email credentials from the request body
    username = data.get('email')
    password = data.get('password')
    smtp_server = data.get('outgoingMailServer')

    # Default to 587 if not provided
    smtp_port = data.get('outgoingMailServerPort', 587)

    # Create the email
    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = to_email
    msg['Subject'] = subject

    # Attach the plain text body
    msg.attach(MIMEText(body, 'plain'))

    # Send the email
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(username, password)
        server.sendmail(username, to_email, msg.as_string())
        server.quit()
        return jsonify({"status": "success", "message": "Email sent successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
