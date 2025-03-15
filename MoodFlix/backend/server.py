from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS

# Initialize the Hugging Face emotion detection pipeline
emotion_model = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your React app

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    try:
        # Get the text from the request JSON
        text = request.json.get('text')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Predict the emotion using Hugging Face pipeline
        result = emotion_model(text)

        # Extract the emotion with the highest confidence
        emotion = result[0]['label']

        return jsonify({"emotion": emotion})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
