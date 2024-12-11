import re
import imaplib
import email
import smtplib
import chardet

from email.header import decode_header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify

email_route = Blueprint('email_route', __name__)


@email_route.route('/', methods=['POST'])
def read_email():
    # Get the email credentials from the request body
    data = request.json
    userEmail = data.get('email')
    userPassword = data.get('password')
    imap_server = data.get('incomingMailServer')

    # Check if the all the required fields are present in the request
    if not userEmail or not userPassword or not imap_server:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    # Check if the email format is valid
    elif not re.match(r"[^@]+@[^@]+\.[^@]+", userEmail):
        return jsonify({"status": "error", "message": "Invalid email format"}), 400
    # Check if the incoming mail server is valid
    elif not re.match(r"[a-zA-Z0-9.-]+", imap_server):
        return jsonify({"status": "error", "message": "Invalid incoming mail server"}), 400

    # Get query parameters for starting ID and number of messages
    start_id = int(data.get('startId', 1))
    num_messages = int(data.get('numMessages', 50))

    # Connect to the server
    mail = imaplib.IMAP4_SSL(imap_server)

    # Login to the account
    mail.login(userEmail, userPassword)

    # Select the mailbox you want to read (in this case, the inbox)
    status, inbox = mail.select("inbox")
    if status != 'OK':
        return jsonify({"status": "error", "message": f"Failed to select mailbox: INBOX"}), 500

    # Search for all emails in the inbox
    status, messages = mail.search(None, 'ALL')
    if status != 'OK':
        return jsonify({"status": "error", "message": "Failed to search emails"}), 500

    email_ids = messages[0].split()

    # Check if the starting ID is within the range of available email IDs
    if start_id < 1 or start_id > len(email_ids):
        return jsonify({"status": "error", "message": "Starting ID out of range"}), 404

    # Calculate the range of email IDs to fetch
    start_index = max(0, start_id - 1)
    end_index = min(start_index + num_messages, len(email_ids))
    email_ids_to_fetch = email_ids[start_index:end_index]

    email_data = []

    for email_id in email_ids_to_fetch:
        # Use the actual email_id as the sequence number
        status, msg_data = mail.fetch(email_id, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])

                # Decode the subject
                subject, encoding = decode_header(msg["subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding or 'utf-8')

                # Decode the from field
                from_ = msg["from"]
                from_parts = decode_header(from_)
                from_decoded = ""
                for part, enc in from_parts:
                    if isinstance(part, bytes):
                        from_decoded += part.decode(enc or 'utf-8')
                    else:
                        from_decoded += part

                email_dict = {
                    "seqno": int(email_id.decode()),
                    "from": from_decoded,
                    "to": msg["to"],
                    "subject": subject,
                    "date": msg["date"],
                    "body": ""
                }

                for part in msg.walk():
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


@email_route.route('/send', methods=['POST'])
def send_email():
    data = request.json
    to_emails = data.get('to', [])  # Expecting a list of email addresses
    cc_emails = data.get('cc', [])  # Expecting a list of CC email addresses
    bcc_emails = data.get('bcc', [])  # Expecting a list of BCC email addresses
    subject = data.get('subject')
    body = data.get('text')

    # Get the email credentials from the request body
    email = data.get('email')
    password = data.get('password')
    smtp_server = data.get('outgoingMailServer')
    # Default to 25 if no port is provided
    smtp_port = data.get('outgoingMailServerPort', 25)

    # Check if the all the required fields are present in the request
    if not userEmail or not userPassword or not smtp_server or not to_emails or not subject or not body:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    # Check if the email format is valid
    elif not re.match(r"[^@]+@[^@]+\.[^@]+", userEmail):
        return jsonify({"status": "error", "message": "Invalid email format"}), 400
    # Check if the outgoing mail server is valid
    elif not re.match(r"[a-zA-Z0-9.-]+", smtp_server):
        return jsonify({"status": "error", "message": "Invalid outgoing mail server"}), 400
    # Check if the email addresses in the to, cc, and bcc fields are valid
    for email_list in [to_emails, cc_emails, bcc_emails]:
        for email_address in email_list:
            if email_address and not re.match(r"[^@]+@[^@]+\.[^@]+", email_address):
                return jsonify({"status": "error", "message": "Invalid recipient email format"}), 400

    # Create the email
    msg = MIMEMultipart()
    msg['From'] = userEmail
    msg['To'] = ", ".join(to_emails)
    msg['Cc'] = ", ".join(cc_emails)
    msg['Bcc'] = ", ".join(bcc_emails)
    msg['Subject'] = subject

    print(
        f"Sending email to {to_emails} with CC to {cc_emails} and BCC to {bcc_emails}")

    # Attach the plain text body
    msg.attach(MIMEText(body, 'plain'))

    # Combine all recipients for the sendmail function
    all_recipients = to_emails + cc_emails + bcc_emails

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.login(userEmail, userPassword)
        # Send to the list of emails
        server.sendmail(userEmail, all_recipients, msg.as_string())
        server.quit()
        return jsonify({"status": "success", "message": "Email sent successfully"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
