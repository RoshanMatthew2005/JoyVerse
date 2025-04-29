# Importing necessary libraries
from flask import Flask, render_template, request, jsonify  # Flask for web app, render_template for HTML rendering, request for handling requests, jsonify for JSON responses
import base64  # For decoding base64 encoded image data
import cv2  # OpenCV for image processing (though not used in this code)
import numpy as np  # For numerical operations (though not used in this code)
from transformers import AutoFeatureExtractor, AutoModelForImageClassification  # Hugging Face Transformers for model and feature extraction
import torch  # PyTorch for model inference
from PIL import Image  # For working with images
from io import BytesIO  # For handling byte streams
import torch.nn.functional as F  # For activation functions like softmax

# Initializing Flask app
app = Flask(__name__)

# Specifying the model to be used for facial expression recognition
model_name = "mo-thecreator/vit-Facial-Expression-Recognition"
extractor = AutoFeatureExtractor.from_pretrained(model_name)  # Loading the feature extractor
model = AutoModelForImageClassification.from_pretrained(model_name)  # Loading the pre-trained model

# Defining the root route of the web app
@app.route('/')
def home():
    # Render index.html when the root URL is accessed
    return render_template('index.html')

# Mapping model's label IDs to human-readable labels
labels = model.config.id2label

# Defining the predict route to handle POST requests
@app.route('/predict', methods=['POST'])
def predict():
    # Extracting the JSON data from the request
    data = request.get_json()
    # Extracting the base64-encoded image data and decoding it
    image_data = data['image'].split(',')[1]
    img_bytes = base64.b64decode(image_data)
    # Opening the image and converting it to RGB
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    
    # Preprocessing the image using the feature extractor
    inputs = extractor(images=img, return_tensors="pt")
    with torch.no_grad():  # Disabling gradient computation for inference
        # Getting the logits (raw model outputs)
        logits = model(**inputs).logits
        # Applying softmax to get probabilities
        probs = F.softmax(logits, dim=1).squeeze().tolist()

    # Creating a dictionary of label-probability pairs
    prediction = {labels[i]: round(prob * 100, 2) for i, prob in enumerate(probs)}
    
    # Returning the predictions as a JSON response
    return jsonify({'prediction': prediction})

# Running the app when the script is executed directly
if __name__ == '__main__':
    app.run(debug=True)  # Enabling debug mode for easier debugging
