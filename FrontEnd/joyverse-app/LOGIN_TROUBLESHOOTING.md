# 🔐 Login Troubleshooting Guide

## ✅ Issue Fixed: API Port Mismatch

**Problem**: Frontend was trying to connect to `http://localhost:5001/api` but backend was running on port `5000`.

**Solution**: Updated `authAPI.js` to use the correct port: `http://localhost:5000/api`

## 🧪 Testing Steps:

### 1. **Verify Backend is Running**
```bash
# Backend should be running on:
http://localhost:5000

# Test health endpoint:
curl http://localhost:5000/api/health
# Should return: {"message":"Joyverse API is running successfully!"}
```

### 2. **Test Registration (Create a Test Account)**
```bash
# Register a therapist account:
curl -X POST http://localhost:5000/api/register/therapist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@therapist.com",
    "password": "test123",
    "fullName": "Test Therapist",
    "phoneNumber": "1234567890",
    "licenseNumber": "LIC123"
  }'
```

### 3. **Test Login**
```bash
# Login with the test account:
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@therapist.com",
    "password": "test123"
  }'
```

## 🎯 **Try This Now:**

1. **Make sure your backend is still running** (you should see the server log)
2. **Refresh your frontend page** (http://localhost:5174)
3. **Try registering a new account** - click "Sign Up" and fill in the form
4. **Then try logging in** with that account

## 🔍 **If Login Still Fails:**

### Check Browser Developer Console:
1. **Open your browser** (Chrome/Firefox)
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Try logging in** and look for error messages
5. **Go to Network tab** and see if API calls are being made

### Common Issues & Solutions:

#### **Issue**: "Network Error" or "Failed to fetch"
- **Solution**: Backend not running or wrong port
- **Check**: Backend terminal should show "🚀 Joyverse API server running on port 5000"

#### **Issue**: "Access denied" or "Invalid credentials"
- **Solution**: Account doesn't exist or wrong password
- **Check**: Register a new account first

#### **Issue**: "CORS Error"
- **Solution**: Backend has CORS enabled, but browser might cache old requests
- **Check**: Clear browser cache or try incognito mode

#### **Issue**: Database connection
- **Solution**: Make sure MongoDB is running
- **Check**: Backend logs should show "MongoDB connected successfully"

## 🚨 **Quick Debug Test:**

Open your browser console (F12) and run this JavaScript:

```javascript
// Test if API is reachable
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => console.log('✅ Backend reachable:', data))
  .catch(error => console.error('❌ Backend error:', error));

// Test registration
fetch('http://localhost:5000/api/register/child', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'testchild@example.com',
    password: 'test123',
    childName: 'Test Child',
    age: 8,
    parentEmail: 'parent@example.com'
  })
})
.then(response => response.json())
.then(data => console.log('✅ Registration result:', data))
.catch(error => console.error('❌ Registration error:', error));
```

## 📝 **Current Status:**
- ✅ Backend running on correct port (5000)
- ✅ Frontend API configuration updated
- ✅ CORS enabled
- ✅ MongoDB connected
- ✅ Health endpoint working

**Next**: Try logging in through the UI now!
