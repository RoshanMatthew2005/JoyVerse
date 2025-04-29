# Importing necessary libraries and modules
from transformers import AutoImageProcessor, AutoModelForImageClassification  # For image processing and model loading
import torch  # For tensor operations
from PIL import Image  # For image handling
import cv2  # For image processing tasks
import torch.nn.functional as F  # For applying softmax to logits

# Load the pre-trained image processor and model for facial expression recognition
processor = AutoImageProcessor.from_pretrained("mo-thecreator/vit-Facial-Expression-Recognition")
model = AutoModelForImageClassification.from_pretrained("mo-thecreator/vit-Facial-Expression-Recognition")

# Function to predict emotions from an input image
def predict_emotion(image):
    # Convert the input image from BGR (OpenCV format) to RGB
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Convert the RGB image to a PIL Image object
    img_pil = Image.fromarray(img_rgb)
    
    # Preprocess the image using the loaded processor
    # This step converts the image into tensors suitable for the model
    inputs = processor(images=img_pil, return_tensors="pt")
    
    # Pass the preprocessed image into the model to get predictions
    outputs = model(**inputs)
    
    # Apply the softmax function to the model's output logits to get probabilities
    probs = F.softmax(outputs.logits, dim=1).squeeze().tolist()
    
    # Retrieve the mapping of label IDs to emotion labels from the model's configuration
    labels = model.config.id2label
    
    # Create a dictionary of emotion labels and their corresponding probabilities
    prediction = {labels[i]: round(p * 100, 2) for i, p in enumerate(probs)}
    
    # Return the prediction as a dictionary
    return prediction
