import torch
import mediapipe as mp
import torch.nn as nn
import torch.nn.functional as F
from einops import rearrange
import numpy as np
import cv2

# ======================== DEVICE ========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ======================== CONSTANTS ========================
IMG_SIZE = 128
PATCH_SIZE = 16
EMB_SIZE = 128
DEPTH = 6
NUM_HEADS = 8
NUM_CLASSES = 5
CLASS_NAMES = ['anger', 'happiness', 'neutral', 'sadness', 'surprise']
LANDMARK_FEATURES = 468 * 2

# ======================== MEDIAPIPE ========================
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1)

def extract_landmarks(image_tensor):
    image_np = image_tensor.permute(1, 2, 0).cpu().numpy()
    image_np = ((image_np * 0.5 + 0.5) * 255).astype(np.uint8)
    results = face_mesh.process(cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR))

    landmarks = []
    if results.multi_face_landmarks:
        for lm in results.multi_face_landmarks[0].landmark:
            landmarks.extend([lm.x, lm.y])
    else:
        landmarks = [0.0] * LANDMARK_FEATURES

    return torch.tensor(landmarks, dtype=torch.float32)

# ======================== VIT MODEL ========================
class PatchEmbedding(nn.Module):
    def __init__(self):
        super().__init__()
        self.projection = nn.Conv2d(3, EMB_SIZE, kernel_size=PATCH_SIZE, stride=PATCH_SIZE)
        self.cls_token = nn.Parameter(torch.randn(1, 1, EMB_SIZE))
        self.positions = nn.Parameter(torch.randn((IMG_SIZE // PATCH_SIZE) ** 2 + 1, EMB_SIZE))

    def forward(self, x):
        x = self.projection(x)
        x = rearrange(x, 'b c h w -> b (h w) c')
        cls_tokens = self.cls_token.expand(x.shape[0], -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x += self.positions
        return x

class TransformerEncoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.attn = nn.MultiheadAttention(EMB_SIZE, NUM_HEADS, dropout=0.1, batch_first=True)
        self.ffn = nn.Sequential(
            nn.Linear(EMB_SIZE, EMB_SIZE * 4),
            nn.GELU(),
            nn.Linear(EMB_SIZE * 4, EMB_SIZE)
        )
        self.norm1 = nn.LayerNorm(EMB_SIZE)
        self.norm2 = nn.LayerNorm(EMB_SIZE)

    def forward(self, x):
        x = x + self.attn(self.norm1(x), self.norm1(x), self.norm1(x))[0]
        x = x + self.ffn(self.norm2(x))
        return x

class VisionTransformerWithLandmarks(nn.Module):
    def __init__(self):
        super().__init__()
        self.embedding = PatchEmbedding()
        self.encoder = nn.Sequential(*[TransformerEncoder() for _ in range(DEPTH)])
        self.mlp_head = nn.Sequential(
            nn.LayerNorm(EMB_SIZE + LANDMARK_FEATURES),
            nn.Linear(EMB_SIZE + LANDMARK_FEATURES, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, NUM_CLASSES)
        )

    def forward(self, x, landmarks):
        x = self.embedding(x)
        x = self.encoder(x)
        x_cls = x[:, 0]
        x_combined = torch.cat((x_cls, landmarks.to(x_cls.device)), dim=1)
        return self.mlp_head(x_combined)
