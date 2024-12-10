import imaplib
from flask import Blueprint, request, jsonify

auth_route = Blueprint('auth_route', __name__)

# Route to authenticate email credentials


@auth_route.route('/login', methods=['POST'])
def login():
    # Get the email credentials from the request body
    data = request.json
    username = data.get('email')
    password = data.get('password')
    imap_server = data.get('incomingMailServer')

    try:
        # Connect to the server
        mail = imaplib.IMAP4_SSL(imap_server)
        # Login to your account
        mail.login(username, password)
        # If login is successful, return a success message
        return jsonify({"status": "success", "message": "Login successful", "data": data}), 200
    except imaplib.IMAP4.error as e:
        # If login fails, return an error message
        return jsonify({"status": "error", "message": str(e)}), 401
