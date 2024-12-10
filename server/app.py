from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

from email_route import email_route  # Import the email_route blueprint

# Load the environment variables if the app is not in production
if os.getenv('FLASK_ENV') != 'production':
    load_dotenv()

# Read the PORT environment variable
port = os.getenv('PORT', 3000)

app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGIN').split(','))


# Set headers to return JSON response
@app.after_request
def set_json_response_header(response):
    response.headers['Content-Type'] = 'application/json'
    return response


# Register the email_route blueprint
app.register_blueprint(email_route, url_prefix='/mail')


# Example route to demonstrate CORS and JSON response
@app.route('/')
def index():
    return jsonify({"message": "Server is running"})


if __name__ == '__main__':
    print("Server is running")
    app.run(debug=True, port=port)
