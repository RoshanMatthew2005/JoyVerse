#!/usr/bin/env python3
"""
JoyVerse Integration Test
Tests all components after migration
"""

import requests
import json
import time
from datetime import datetime

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8001/docs")
        return response.status_code == 200
    except:
        return False

def test_frontend_health():
    """Test if frontend is running"""
    # Try common ports for Vite dev server
    ports = [5174, 5173, 3000]
    for port in ports:
        try:
            response = requests.get(f"http://localhost:{port}")
            if response.status_code == 200:
                return True
        except:
            continue
    return False

def test_emotion_api():
    """Test emotion API with a simple image"""
    try:
        # Create a simple test image (placeholder)
        test_image_data = b"dummy_image_data"
        files = {"file": ("test.jpg", test_image_data, "image/jpeg")}
        
        response = requests.post("http://localhost:8001/predict/", files=files)
        return response.status_code in [200, 422]  # 422 is expected for dummy data
    except Exception as e:
        print(f"API Error: {e}")
        return False

def test_mongodb_connection():
    """Test if MongoDB is accessible"""
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        return True
    except:
        return False

def main():
    print("🧪 JoyVerse Integration Test Suite")
    print("=" * 50)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Backend Health Check", test_backend_health),
        ("Frontend Health Check", test_frontend_health),
        ("MongoDB Connection", test_mongodb_connection),
        ("Emotion API Endpoint", test_emotion_api),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"Running: {name}... ", end="", flush=True)
        try:
            result = test_func()
            status = "✅ PASS" if result else "❌ FAIL"
            results.append((name, result))
            print(status)
        except Exception as e:
            print(f"❌ ERROR: {e}")
            results.append((name, False))
    
    print()
    print("Test Results Summary:")
    print("-" * 30)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
        if not result:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 All tests passed! Migration successful!")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    return all_passed

if __name__ == "__main__":
    main()
