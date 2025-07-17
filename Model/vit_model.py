"""
Vision Transformer (ViT) Model for Emotion Recognition
====================================================

This module implements a custom Vision Transformer architecture specifically designed 
for emotion detection in children's facial expressions. The model combines visual 
features from images with facial landmark coordinates for improved accuracy.

The architecture follows the original ViT paper but is adapted for emotion classification
with multi-modal input (images + facial landmarks).
"""

# ========================================
# IMPORTS AND DEPENDENCIES
# ========================================

import torch
# PyTorch core library - provides tensor operations, automatic differentiation, and GPU support
# Used for: Creating tensors, device management (CPU/GPU), mathematical operations
# Essential for all deep learning operations in this model

import torch.nn as nn
# PyTorch neural network module - contains all building blocks for neural networks
# Used for: Layer definitions (Conv2d, Linear, LayerNorm), activation functions (ReLU, GELU),
#          regularization (Dropout), and base classes (nn.Module, nn.Parameter)
# This is the foundation for building our transformer architecture

from einops import rearrange
# Einstein Operations (einops) - provides intuitive tensor manipulation operations
# Used for: Reshaping tensors with clear, readable syntax
# Specifically used to convert 4D image tensors [B, C, H, W] to 3D sequence tensors [B, N, C]
# Much clearer than torch.reshape() for complex tensor transformations
# Example: 'b c h w -> b (h w) c' converts image patches to sequence format

# Model Configuration Constants
IMG_SIZE = 128              # Input image size (128x128 pixels)
PATCH_SIZE = 16             # Size of each image patch (16x16 pixels)
EMB_SIZE = 128              # Embedding dimension for transformer
DEPTH = 6                   # Number of transformer encoder layers
NUM_HEADS = 8               # Number of attention heads in multi-head attention
NUM_CLASSES = 5             # Number of emotion classes: anger, happiness, neutral, sadness, surprise
LANDMARK_FEATURES = 468 * 2 # MediaPipe face landmarks (468 points × 2 coordinates = 936 features)

class PatchEmbedding(nn.Module):
    """
    Patch Embedding Layer for Vision Transformer
    ==========================================
    
    Converts input images into patch embeddings with positional encoding.
    This is the first stage of the ViT pipeline that transforms 2D images 
    into sequences of patches that can be processed by transformer layers.
    
    Process:
    1. Split 128x128 image into 8x8 grid of 16x16 patches (64 patches total)
    2. Convert each patch to a 128-dimensional embedding using convolution
    3. Add a learnable [CLS] token at the beginning
    4. Add positional encodings to maintain spatial information
    """
    
    def __init__(self):
        super().__init__()
        # Convolutional layer that acts as patch embedding
        # kernel_size=PATCH_SIZE and stride=PATCH_SIZE ensures non-overlapping patches
        self.projection = nn.Conv2d(3, EMB_SIZE, kernel_size=PATCH_SIZE, stride=PATCH_SIZE)
        
        # Learnable [CLS] token - used for final classification (similar to BERT)
        # This token aggregates information from all patches
        self.cls_token = nn.Parameter(torch.randn(1, 1, EMB_SIZE))
        
        # Learnable positional embeddings for each patch + CLS token
        # Total positions = (IMG_SIZE // PATCH_SIZE)² + 1 = 8² + 1 = 65
        self.positions = nn.Parameter(torch.randn((IMG_SIZE // PATCH_SIZE) ** 2 + 1, EMB_SIZE))

    def forward(self, x):
        """
        Forward pass through patch embedding layer
        
        Args:
            x: Input images of shape [batch_size, 3, 128, 128]
            
        Returns:
            Patch embeddings with shape [batch_size, 65, 128]
            (65 = 64 patches + 1 CLS token, 128 = embedding dimension)
        """
        # Apply patch embedding: [B, 3, 128, 128] -> [B, 128, 8, 8]
        x = self.projection(x)
        
        # Flatten spatial dimensions: [B, 128, 8, 8] -> [B, 64, 128]
        x = rearrange(x, 'b c h w -> b (h w) c')
        
        # Expand CLS token for batch: [1, 1, 128] -> [B, 1, 128]
        cls_tokens = self.cls_token.expand(x.shape[0], -1, -1)
        
        # Concatenate CLS token with patches: [B, 1, 128] + [B, 64, 128] -> [B, 65, 128]
        x = torch.cat((cls_tokens, x), dim=1)
        
        # Add positional embeddings to maintain spatial relationships
        x += self.positions
        
        return x

class TransformerEncoder(nn.Module):
    """
    Transformer Encoder Block
    ========================
    
    A single transformer encoder layer with multi-head self-attention and 
    feed-forward network. This is the core building block of the Vision Transformer.
    
    Components:
    1. Multi-Head Self-Attention: Allows the model to attend to different parts of the image
    2. Feed-Forward Network: Processes the attended features
    3. Layer Normalization: Stabilizes training and improves convergence
    4. Residual Connections: Helps with gradient flow in deep networks
    """
    
    def __init__(self):
        super().__init__()
        # Multi-head self-attention mechanism
        # 8 attention heads allow the model to focus on different aspects simultaneously
        self.attn = nn.MultiheadAttention(EMB_SIZE, NUM_HEADS, dropout=0.1, batch_first=True)
        
        # Feed-forward network (MLP)
        # Expands to 4x embedding size then back down (standard transformer practice)
        self.ffn = nn.Sequential(
            nn.Linear(EMB_SIZE, EMB_SIZE * 4),  # Expand: 128 -> 512
            nn.GELU(),                          # Gaussian Error Linear Unit activation
            nn.Linear(EMB_SIZE * 4, EMB_SIZE)   # Contract: 512 -> 128
        )
        
        # Layer normalization for attention and FFN (Pre-LN architecture)
        self.norm1 = nn.LayerNorm(EMB_SIZE)
        self.norm2 = nn.LayerNorm(EMB_SIZE)

    def forward(self, x):
        """
        Forward pass through transformer encoder block
        
        Args:
            x: Input tensor of shape [batch_size, sequence_length, embedding_dim]
            
        Returns:
            Processed tensor of same shape with attended and transformed features
        """
        # Self-attention with residual connection and pre-layer normalization
        # Pre-LN: Normalize -> Attention -> Residual (more stable than Post-LN)
        attn_output = self.attn(self.norm1(x), self.norm1(x), self.norm1(x))[0]
        x = x + attn_output  # Residual connection
        
        # Feed-forward network with residual connection and pre-layer normalization
        ffn_output = self.ffn(self.norm2(x))
        x = x + ffn_output  # Residual connection
        
        return x

class ViTEmotionModel(nn.Module):
    """
    Vision Transformer for Emotion Recognition
    =========================================
    
    Complete Vision Transformer model adapted for emotion classification.
    This model combines visual features from facial images with facial landmark 
    coordinates to predict emotions in children's faces.
    
    Architecture:
    1. Patch Embedding: Converts images to patch sequences
    2. Transformer Encoders: 6 layers of self-attention and FFN
    3. Multi-modal Fusion: Combines visual features with facial landmarks
    4. Classification Head: Maps combined features to emotion probabilities
    
    Input:
    - Images: [batch_size, 3, 128, 128] RGB facial images
    - Landmarks: [batch_size, 936] facial landmark coordinates (468 points × 2)
    
    Output:
    - Emotion logits: [batch_size, 5] for 5 emotion classes
    """
    
    def __init__(self):
        super().__init__()
        # Patch embedding layer - converts images to sequence of patches
        self.embedding = PatchEmbedding()
        
        # Stack of transformer encoder layers (6 layers)
        # Each layer has multi-head attention and feed-forward network
        self.encoder = nn.Sequential(*[TransformerEncoder() for _ in range(DEPTH)])
        
        # Multi-modal classification head
        # Combines visual features (128-dim) with facial landmarks (936-dim)
        # Total input dimension: 128 + 936 = 1064
        self.mlp_head = nn.Sequential(
            nn.LayerNorm(EMB_SIZE + LANDMARK_FEATURES),  # Normalize combined features
            nn.Linear(EMB_SIZE + LANDMARK_FEATURES, 512), # Project to hidden layer
            nn.ReLU(),                                    # Non-linear activation
            nn.Dropout(0.3),                             # Regularization to prevent overfitting
            nn.Linear(512, NUM_CLASSES)                  # Final classification layer (5 emotions)
        )

    def forward(self, x, landmarks):
        """
        Forward pass through the complete ViT emotion model
        
        Args:
            x: Input images of shape [batch_size, 3, 128, 128]
            landmarks: Facial landmark coordinates [batch_size, 936]
            
        Returns:
            Emotion logits of shape [batch_size, 5]
            Apply softmax to get probabilities for each emotion class
        """
        # Step 1: Convert image to patch embeddings
        # [B, 3, 128, 128] -> [B, 65, 128] (65 = 64 patches + 1 CLS token)
        x = self.embedding(x)
        
        # Step 2: Process through transformer encoder layers
        # Each layer applies self-attention and feed-forward transformations
        # Shape remains [B, 65, 128] but features become more refined
        x = self.encoder(x)
        
        # Step 3: Extract CLS token representation
        # The CLS token (first token) aggregates information from all patches
        # [B, 65, 128] -> [B, 128] (take only the first token)
        x_cls = x[:, 0]
        
        # Step 4: Multi-modal fusion
        # Combine visual features (CLS token) with facial landmarks
        # Ensure landmarks are on the same device as the visual features
        x_combined = torch.cat((x_cls, landmarks.to(x_cls.device)), dim=1)
        # Shape: [B, 128 + 936] = [B, 1064]
        
        # Step 5: Classification
        # Map combined features to emotion probabilities
        # [B, 1064] -> [B, 512] -> [B, 5]
        return self.mlp_head(x_combined)
