# save_model.py
import torch
from model import VisionTransformer  # same model used in train.py

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 1. Create the model
model = VisionTransformer().to(device)

# 2. Load the trained weights
trained_model_path = "vit_emotion_model.pth"  # 👈 MATCHED NAME FROM train.py
model.load_state_dict(torch.load(trained_model_path, map_location=device))
print(f"✅ Loaded trained model from: {trained_model_path}")

# 3. Save the model to a new file (optional step if you want to rename or confirm)
save_path = "vit_emotion_model.pth"
torch.save(model.state_dict(), save_path)
print(f"✅ Model re-saved to: {save_path}")
