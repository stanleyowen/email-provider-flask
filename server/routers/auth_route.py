import re
import imaplib

from flask import Blueprint, request, jsonify

auth_route = Blueprint('auth_route', __name__)


# Route to authenticate email credentials
@auth_route.route('/login', methods=['POST'])
def login():
    # Get the email credentials from the request body
    data = request.json
    email = data.get('email')
    password = data.get('password')
    imap_server = data.get('incomingMailServer')

    # Check if the all the required fields are present in the request
    if not email or not password or not imap_server:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    # Check if the email format is valid
    elif not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"status": "error", "message": "Invalid email format"}), 400
    # Check if the incoming mail server is valid
    elif not re.match(r"[a-zA-Z0-9.-]+", imap_server):
        return jsonify({"status": "error", "message": "Invalid incoming mail server"}), 400

    # Check if the email credentials are valid by attempting to login
    try:
        # Connect to the server
        mail = imaplib.IMAP4_SSL(imap_server)
        # Login to your account
        mail.login(email, password)
        # If login is successful, return a success message
        return jsonify({"status": "success", "message": "Login successful", "data": data}), 200
    except imaplib.IMAP4.error as e:
        # If login fails, return an error message
        return jsonify({"status": "error", "message": str(e)}), 401
