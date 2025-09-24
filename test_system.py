"""
Test script for SecureAttend OpenCV integration
"""

import cv2
import numpy as np
import base64
import requests
import json
import time
from pathlib import Path

def test_face_detection():
    """Test face detection functionality"""
    print("🔍 Testing Face Detection...")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Camera not available")
        return False
    
    # Capture a frame
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Failed to capture frame")
        return False
    
    # Convert frame to base64
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    
    try:
        # Test face registration endpoint
        response = requests.post(
            'http://localhost:8000/face/register',
            json={
                'user_id': 'test_user_001',
                'frame_data': frame_base64
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Face Registration: {result['message']}")
            return True
        else:
            print(f"❌ Face Registration Failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not running. Please start the server first.")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_attendance_processing():
    """Test attendance processing functionality"""
    print("👤 Testing Attendance Processing...")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Camera not available")
        return False
    
    # Capture a frame
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Failed to capture frame")
        return False
    
    # Convert frame to base64
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    
    try:
        # Test attendance processing endpoint
        response = requests.post(
            'http://localhost:8000/attendance/process',
            json={
                'frame_data': frame_base64,
                'user_session': {
                    'timestamp': time.time(),
                    'session_id': 'test_session_001'
                }
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Attendance Processing: {result['message']}")
            if result.get('data'):
                data = result['data']
                print(f"   - Face Detected: {data.get('face_detected', False)}")
                print(f"   - Confidence: {data.get('confidence', 0):.2f}")
                print(f"   - Eyes Detected: {data.get('eyes_detected', 0)}")
                print(f"   - Liveness Score: {data.get('liveness_score', 0):.2f}")
                print(f"   - Processing Time: {data.get('processing_time', 0):.2f}s")
            return True
        else:
            print(f"❌ Attendance Processing Failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not running. Please start the server first.")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_api_endpoints():
    """Test basic API endpoints"""
    print("🌐 Testing API Endpoints...")
    
    endpoints = [
        ('GET', 'http://localhost:8000/', 'Root endpoint'),
        ('GET', 'http://localhost:8000/health', 'Health check'),
        ('GET', 'http://localhost:8000/attendance/stats', 'Attendance stats')
    ]
    
    for method, url, description in endpoints:
        try:
            if method == 'GET':
                response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {description}: OK")
            else:
                print(f"❌ {description}: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {description}: Server not running")
        except Exception as e:
            print(f"❌ {description}: {e}")

def test_opencv_installation():
    """Test OpenCV installation and functionality"""
    print("📷 Testing OpenCV Installation...")
    
    try:
        # Test basic OpenCV functionality
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        print("✅ OpenCV basic functions: OK")
        
        # Test cascade classifiers
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        if not face_cascade.empty() and not eye_cascade.empty():
            print("✅ OpenCV cascade classifiers: OK")
        else:
            print("❌ OpenCV cascade classifiers: Failed to load")
            
        # Test camera access
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✅ Camera access: OK")
            cap.release()
        else:
            print("❌ Camera access: Failed")
            
        return True
        
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 SecureAttend System Test")
    print("=" * 50)
    
    # Test OpenCV installation
    opencv_ok = test_opencv_installation()
    print()
    
    # Test API endpoints
    test_api_endpoints()
    print()
    
    if opencv_ok:
        # Test face detection
        face_detection_ok = test_face_detection()
        print()
        
        # Test attendance processing
        attendance_ok = test_attendance_processing()
        print()
        
        print("=" * 50)
        if face_detection_ok and attendance_ok:
            print("🎉 All tests passed! System is ready for use.")
        else:
            print("⚠️  Some tests failed. Please check the backend server and camera.")
    else:
        print("❌ OpenCV installation issues detected. Please check requirements.")

if __name__ == "__main__":
    main()
