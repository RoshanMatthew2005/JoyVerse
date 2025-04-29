from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
from PIL import Image
import cv2
import torch.nn.functional as F

processor = AutoImageProcessor.from_pretrained("mo-thecreator/vit-Facial-Expression-Recognition")
model = AutoModelForImageClassification.from_pretrained("mo-thecreator/vit-Facial-Expression-Recognition")

def predict_emotion(image):
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    inputs = processor(images=img_pil, return_tensors="pt")
    outputs = model(**inputs)
    
    probs = F.softmax(outputs.logits, dim=1).squeeze().tolist()
    labels = model.config.id2label
    prediction = {labels[i]: round(p * 100, 2) for i, p in enumerate(probs)}
    
    return prediction
