import imaplib
import email
import smtplib
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

    print(username, password, imap_server)

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
                    if part.get_content_type() == "text/html":
                        payload = part.get_payload(decode=True)
                        if payload:
                            email_dict["body"] = payload.decode()
                            break  # Prioritize HTML content
                    elif part.get_content_type() == "text/plain" and not email_dict["body"]:
                        payload = part.get_payload(decode=True)
                        if payload:
                            email_dict["body"] = payload.decode()
                email_data.append(email_dict)

    return jsonify(email_data)
