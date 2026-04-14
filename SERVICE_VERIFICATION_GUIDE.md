# ✅ Service Verification & Testing Guide

## 🔍 Step 1: Verify MySQL is Running

### Check MySQL Service Status
```powershell
# Windows - Check if MySQL service is running
Get-Service | findstr MySQL
```

**Expected Output:**
```
Status   Name                DisplayName
Running  MySQL80             MySQL80
```

### Connect to MySQL
```powershell
mysql -u root -p
# Password: Password123@
```

**Expected Output:**
```
Welcome to the MySQL monitor.  Commands end with ; or \g.
mysql>
```

### List Databases
```sql
SHOW DATABASES;
```

**Expected Output:**
```
+--------------------+
| Database           |
+--------------------+
| admin_db           |
| appointment_db     |
| doctor_db          |
| information_schema |
| mysql              |
| patient_db         |
| payment_db         |
| performance_schema |
| telemedicine_db    |
+--------------------+
```

Type `exit` to quit.

---

## 🚀 Step 2: Start All Backend Services

### Terminal 1: API Gateway (Port 8084)
```powershell
cd "C:\Users\jaliy\Desktop\puita web\Healthcare-platform\api-gateway"
./mvnw spring-boot:run
```

**Wait for message:**
```
Tomcat started on port(s): 8084 (http)
```

---

### Terminal 2: Patient Service (Port 8080)
```powershell
cd "C:\Users\jaliy\Desktop\puita web\Healthcare-platform\patient-service"
./mvnw spring-boot:run
```

**Wait for message:**
```
Started PatientServiceApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

---

### Terminal 3: SymptomChecker Service (Port 8087)
```powershell
cd "C:\Users\jaliy\Desktop\puita web\Healthcare-platform\SymptomChecker-Service"
./mvnw spring-boot:run
```

**Wait for message:**
```
Started SymptomCheckerServiceApplication in X.XXX seconds
Tomcat started on port(s): 8087 (http)
```

---

### Terminal 4: Other Services (Optional for full testing)
```powershell
# Doctor Service (Port 8081)
cd doctor-service
./mvnw spring-boot:run

# Appointment Service (Port 8082)
cd appointment-service
./mvnw spring-boot:run

# Payment Service (Port 8086)
cd payment-service
./mvnw spring-boot:run

# Telemedicine Service (Port 8085)
cd telemedicine-service
./mvnw spring-boot:run
```

---

## 🌐 Step 3: Start Frontend (Port 5173)

### Terminal 5: React Frontend
```powershell
cd "C:\Users\jaliy\Desktop\puita web\Healthcare-platform\client"
npm run dev
```

**Expected Output:**
```
  VITE v8.0.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

## ✅ Step 4: Verify Services Are Running

### Check API Gateway Health
```powershell
curl http://localhost:8084/health
```

**Expected Output:**
```json
{"status":"UP"}
```

Or use PowerShell:
```powershell
Invoke-RestMethod http://localhost:8084/health
```

---

### Check SymptomChecker Service Health
```powershell
curl http://localhost:8087/actuator/health
```

**Expected Output:**
```json
{"status":"UP"}
```

---

### Check All Services
| Service | Port | Health URL | Expected |
|---------|------|-----------|----------|
| API Gateway | 8084 | http://localhost:8084/health | ✅ UP |
| Patient Service | 8080 | http://localhost:8080/actuator/health | ✅ UP |
| Doctor Service | 8081 | http://localhost:8081/actuator/health | ✅ UP |
| Appointment Service | 8082 | http://localhost:8082/actuator/health | ✅ UP |
| Telemedicine Service | 8085 | http://localhost:8085/actuator/health | ✅ UP |
| SymptomChecker Service | 8087 | http://localhost:8087/actuator/health | ✅ UP |
| Payment Service | 8086 | http://localhost:8086/actuator/health | ✅ UP |
| Frontend | 5173 | http://localhost:5173 | ✅ Loads |

---

## 🧪 Step 5: Test SymptomChecker API Directly

### Test 1: Using Curl (PowerShell)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-User-Role" = "PATIENT"
}

$body = @{
    symptoms = "fever, cough, sore throat"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8087/api/symptoms/analyze" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Expected Response:**
```json
{
  "possibleConditions": ["Pharyngitis", "Laryngitis", "Bronchitis"],
  "recommendedSpecialty": "ENT Specialist",
  "urgency": "LOW",
  "advice": "Please consult with a qualified physician for proper evaluation. Monitor your symptoms and seek immediate care if they worsen.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

---

### Test 2: Using Postman / Insomnia

**Method:** POST  
**URL:** http://localhost:8087/api/symptoms/analyze

**Headers:**
```
Content-Type: application/json
X-User-Role: PATIENT
```

**Body (Raw JSON):**
```json
{
  "symptoms": "fever, cough, sore throat"
}
```

**Expected:** 200 OK with results

---

### Test 3: Test Different Urgency Levels

#### HIGH Urgency (Cardiac)
```json
{
  "symptoms": "severe chest pain, heart palpitations, shortness of breath"
}
```

**Expected Response:**
```json
{
  "possibleConditions": ["Acute Coronary Syndrome", "Angina", "Myocarditis"],
  "recommendedSpecialty": "Cardiologist",
  "urgency": "HIGH",
  "advice": "These symptoms may indicate a serious condition. Please seek immediate medical attention at an emergency department or call emergency services.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

---

#### MEDIUM Urgency (GI)
```json
{
  "symptoms": "severe abdominal pain, stomach cramps, nausea"
}
```

**Expected Response:**
```json
{
  "possibleConditions": ["Gastroenteritis", "Peptic Ulcer", "Hepatitis"],
  "recommendedSpecialty": "Gastroenterologist",
  "urgency": "MEDIUM",
  "advice": "These symptoms warrant prompt medical evaluation. Please schedule an appointment with a healthcare provider within 24-48 hours.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

---

#### LOW Urgency (Dermatology)
```json
{
  "symptoms": "skin rash, itching, mild discomfort"
}
```

**Expected Response:**
```json
{
  "possibleConditions": ["Allergic Dermatitis", "Psoriasis", "Eczema"],
  "recommendedSpecialty": "Dermatologist",
  "urgency": "LOW",
  "advice": "Please consult with a qualified physician for proper evaluation. Monitor your symptoms and seek immediate care if they worsen.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

---

## 🎨 Step 6: Test Frontend GUI

### Navigate to Symptom Checker
1. Open http://localhost:5173
2. Click "Patient" button (quick login)
3. You should see Patient Dashboard
4. Click "Symptom Checker" in sidebar OR "Start Symptom Check" button
5. Should navigate to /patient/symptoms

### Test Form Submission
1. Type in symptom box: `fever, headache, muscle pain`
2. Click "Analyze Symptoms" button
3. Should see:
   - Loading spinner ⏳
   - Request sent to API
   - Results displayed with urgency badge 🟡

### Verify Results Display
- ✅ Urgency badge shows (🔴 HIGH / 🟡 MEDIUM / 🟢 LOW)
- ✅ Recommended specialty displays
- ✅ List of possible conditions
- ✅ Medical advice text
- ✅ Disclaimer at bottom
- ✅ "Book Appointment" button
- ✅ "New Analysis" button

---

## 🔍 Step 7: Test Error Cases

### Test 1: Empty Input
1. Leave textarea empty
2. Click "Analyze Symptoms"
3. **Expected:** Error message "Please describe your symptoms"

### Test 2: Too Short (Less than 3 chars)
1. Type: `ab`
2. Click "Analyze Symptoms"
3. **Expected:** Error message "Symptom description must be at least 3 characters"

### Test 3: Too Long (More than 1000 chars)
1. Copy paste repeated text (>1000 chars)
2. **Expected:** Character counter shows limit reached, button disabled

### Test 4: Network Error (API Down)
1. Stop SymptomChecker Service
2. Try to analyze symptoms
3. **Expected:** Error message "Failed to analyze symptoms. Please try again."

---

## 📊 Step 8: Database Verification

### Check if tables were created
```sql
-- Connect to MySQL
mysql -u root -p Password123@

-- Select a database
USE patient_db;

-- List tables
SHOW TABLES;
```

**Expected:** Tables like `patient`, `user_roles`, etc.

---

## 🐛 Troubleshooting

### ❌ Port Already in Use
**Error:** `Port 8087 already in use`

**Solution:**
```powershell
# Find process using port 8087
netstat -ano | findstr :8087

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change service port in application.properties
```

---

### ❌ Connection Refused
**Error:** `java.net.ConnectException: Connection refused`

**Solution:**
1. Check if MySQL is running: `Get-Service MySQL80`
2. Ensure all services are started
3. Check port numbers are not conflicting

---

### ❌ API Returns 401 (Unauthorized)
**Error:** `401 Unauthorized`

**Solution:**
1. Ensure auth token in localStorage
2. Check X-User-Role header is set to PATIENT
3. Verify Authorization header has Bearer token

---

### ❌ CORS Issues (Frontend)
**Error:** `No 'Access-Control-Allow-Origin' header`

**Solution:**
- Make sure requests go through API Gateway (8084)
- Not directly to service ports (8087)
- Gateway handles CORS

---

### ❌ Database Connection Error
**Error:** `Error connecting to localhost:3306`

**Solution:**
```powershell
# Start MySQL service
net start MySQL80

# Wait a few seconds and try again
```

---

## ✨ Quick Test Commands (All in One)

```powershell
# 1. Check MySQL
mysql -u root -pPassword123@ -e "SELECT VERSION();"

# 2. Check API Gateway
Invoke-RestMethod http://localhost:8084/health

# 3. Check SymptomChecker Service
Invoke-RestMethod http://localhost:8087/actuator/health

# 4. Test SymptomChecker API
$headers = @{"Content-Type"="application/json"; "X-User-Role"="PATIENT"}
$body = @{symptoms="fever, cough"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8087/api/symptoms/analyze" -Method POST -Headers $headers -Body $body

# 5. Check Frontend
Start-Process "http://localhost:5173"
```

---

## 📋 Verification Checklist

- [ ] MySQL running (`Get-Service MySQL80`)
- [ ] API Gateway running (port 8084, shows "UP")
- [ ] SymptomChecker Service running (port 8087, shows "UP")
- [ ] Frontend running (port 5173, loads without errors)
- [ ] Can navigate to /patient/symptoms
- [ ] Form accepts input (min 3 chars)
- [ ] API call succeeds (returns JSON)
- [ ] Results display correctly
- [ ] Urgency level shows correct color
- [ ] No console errors in browser DevTools

---

## 🎯 Expected Workflow

```
1. ✅ All services running
2. ✅ Frontend loads at localhost:5173
3. ✅ Patient Dashboard accessible
4. ✅ Click "Symptom Checker" → Navigate to /patient/symptoms
5. ✅ Enter symptoms → API returns results
6. ✅ Results display with urgency badge & recommendations
7. ✅ Can click "Book Appointment" or "New Analysis"
8. ✅ No errors in console
```

---

## 📞 Still Having Issues?

1. **Check logs** - Each service shows startup logs
2. **Check browser console** - F12 → Console tab
3. **Check network tab** - F12 → Network tab
4. **Verify URLs** - Ensure localhost not 127.0.0.1
5. **Clear cache** - F12 → Application → Storage → Clear All
6. **Restart services** - Kill and restart terminals

**All systems ready? 🚀 You're good to go!**
