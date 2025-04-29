from flask import Flask, render_template, request, jsonify
import base64
import cv2
import numpy as np
from transformers import AutoFeatureExtractor, AutoModelForImageClassification
import torch
from PIL import Image
from io import BytesIO
import torch.nn.functional as F

app = Flask(__name__)


model_name = "mo-thecreator/vit-Facial-Expression-Recognition"
extractor = AutoFeatureExtractor.from_pretrained(model_name)
model = AutoModelForImageClassification.from_pretrained(model_name)

@app.route('/')
def home():
    return render_template('index.html')

labels = model.config.id2label
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    image_data = data['image'].split(',')[1]
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    
    inputs = extractor(images=img, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = F.softmax(logits, dim=1).squeeze().tolist()

    prediction = {labels[i]: round(prob * 100, 2) for i, prob in enumerate(probs)}
    
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True)
