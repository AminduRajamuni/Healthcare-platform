# Symptom Checker Service - Complete Flow Documentation

## 📋 CURRENT BACKEND STATUS: ✅ ALREADY IMPLEMENTED

Your backend is **COMPLETE** with:
- ✅ SymptomCheckerServiceApplication (Spring Boot main class)
- ✅ SymptomCheckerController (REST endpoint)
- ✅ SymptomAnalyzerService (Pattern-matching logic with 10 medical patterns)
- ✅ DTOs (SymptomRequest, SymptomAnalysisResponse)
- ✅ Security configuration with JWT + role-based access
- ✅ Pattern database mapping symptoms to conditions/specialties/urgency

---

## 🔄 COMPLETE FLOW BREAKDOWN

### **LAYER 1: FRONTEND (React)**
**Location**: `client/src/pages/` and `client/src/components/`

```
What happens:
1. Patient navigates to symptom checker page
2. Form displays text input field
3. Patient types symptoms: "chest pain, shortness of breath"
4. Clicks "Analyze Symptoms" button
5. Frontend makes HTTP request:
   
   POST http://localhost:5173/api/symptoms/analyze
   Headers: {
     "Authorization": "Bearer {jwt_token}",
     "Content-Type": "application/json"
   }
   Body: {
     "symptoms": "chest pain, shortness of breath"
   }
```

---

### **LAYER 2: VITE DEV SERVER PROXY**
**Location**: `client/vite.config.js`

```
What happens:
1. Vite dev server intercepts request to /api/symptoms/analyze
2. Checks vite.config.js proxy configuration
3. Forwards to: http://localhost:8084 (API Gateway)
4. Adds header: X-Forwarded-For, X-Forwarded-Proto
```

**Proxy Config in vite.config.js**:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8084',  // API Gateway
      changeOrigin: true
    }
  }
}
```

---

### **LAYER 3: API GATEWAY**
**Port**: 8084  
**Location**: `api-gateway/src/`

```
What happens:
1. Request arrives at API Gateway:8084/api/symptoms/analyze
2. AuthenticationFilter intercepts request
3. Extracts JWT token from Authorization header
4. Validates token using JwtUtil.isInvalid()
5. If invalid → Returns 401 Unauthorized
6. If valid → Extracts userId and role from token
7. Adds headers:
   - X-User-Id: {userId}
   - X-User-Role: {role}
8. Routes to configured service based on path pattern
   - /api/symptoms/** routes to → http://localhost:8087

Flow diagram:
  Request
    ↓
  AuthenticationFilter
    ↓
  JWT Validation (JwtUtil.isInvalid())
    ↓
  Token Valid? ──NO──→ 401 Unauthorized
    ↓ YES
  Extract userId & role
    ↓
  Add X-User-Id, X-User-Role headers
    ↓
  Route lookup: /api/symptoms/** matches 8087
    ↓
  Forward to Symptom Checker Service:8087
```

---

### **LAYER 4: SYMPTOM CHECKER SERVICE**
**Port**: 8087  
**Location**: `SymptomChecker-Service/src/main/java/com/healthcare/symptomcheckerservice/`

#### **4A: Controller Layer**
**File**: `SymptomCheckerController.java`

```
What happens:
1. Request received: POST /api/symptoms/analyze
2. Spring routes to: @PostMapping("/analyze")
3. Checks security: @PreAuthorize("hasRole('PATIENT')")
   - If user role ≠ PATIENT → 403 Forbidden
   - If user role = PATIENT → Continue
4. SymptomRequest validated (Jackson deserialization)
   - symptoms field checked: @NotBlank, @Size(3-1000)
   - If validation fails → 400 Bad Request with error messages
5. Call: symptomAnalyzerService.analyze(request)
```

#### **4B: Service Layer - Pattern Matching**
**File**: `SymptomAnalyzerService.java`

```
What happens:
1. Receive SymptomRequest with symptoms = "chest pain, shortness of breath"
2. Convert to lowercase: "chest pain, shortness of breath"
3. Initialize:
   - matchedConditions = []
   - recommendedSpecialty = "General Physician"
   - urgency = "LOW"
4. Score all symptom patterns (10 patterns in SYMPTOM_PATTERNS map)

Pattern Matching Algorithm:
Pattern: "chest pain|heart|palpitations|chest tightness"
  Keywords: ["chest pain", "heart", "palpitations", "chest tightness"]
  Check each keyword:
    - symptoms contains "chest pain"? YES → matchCount = 1
    - symptoms contains "heart"? NO
    - symptoms contains "palpitations"? NO
    - symptoms contains "chest tightness"? NO
  Score for this pattern: 1

Pattern: "shortness of breath|breathing|dyspnea"
  Keywords: ["shortness of breath", "breathing", "dyspnea"]
  Check each keyword:
    - symptoms contains "shortness of breath"? YES → matchCount = 1
    - symptoms contains "breathing"? NO
    - symptoms contains "dyspnea"? NO
  Score for this pattern: 1

(Continue for all 10 patterns...)

5. Find best pattern (highest score):
   If tie → Use first one found
   Best pattern: "chest pain|heart|palpitations|chest tightness" (or the difficulty breathing one)

6. Extract data from best pattern:
   conditions = ["Acute Coronary Syndrome", "Angina", "Myocarditis"]
   specialty = "Cardiologist"
   urgency = "HIGH"

7. Build advice based on urgency:
   if urgency = "HIGH":
     advice = "These symptoms may indicate a serious condition. 
               Please seek immediate medical attention at an emergency 
               department or call emergency services."

8. Build response object:
   {
     "possibleConditions": ["Acute Coronary Syndrome", "Angina", "Myocarditis"],
     "recommendedSpecialty": "Cardiologist",
     "urgency": "HIGH",
     "advice": "These symptoms may indicate a serious condition...",
     "disclaimer": "This is an AI-generated preliminary suggestion..."
   }
```

#### **The 10 Symptom Patterns**

| Pattern Keywords | Conditions | Specialty | Urgency |
|---|---|---|---|
| chest pain, heart, palpitations, chest tightness | Acute Coronary Syndrome, Angina, Myocarditis | Cardiologist | HIGH |
| fever, high temp | Influenza, Common Cold, Pneumonia | Internal Medicine | MEDIUM |
| cough, sore throat, throat | Pharyngitis, Laryngitis, Bronchitis | ENT Specialist | LOW |
| shortness of breath, breathing, dyspnea | Bronchitis, Asthma, Pneumonia | Pulmonologist | HIGH |
| headache, migraine | Tension Headache, Migraine, Cluster Headache | Neurologist | LOW |
| stiff neck, neck pain | Meningitis, Cervicalgia, Torticollis | Neurologist | HIGH |
| abdominal pain, stomach pain, belly | Gastroenteritis, Peptic Ulcer, Hepatitis | Gastroenterologist | MEDIUM |
| rash, skin, itching, itch | Allergic Dermatitis, Psoriasis, Eczema | Dermatologist | LOW |
| joint pain, arthritis, arthralgia | Osteoarthritis, Rheumatoid Arthritis, Gout | Rheumatologist | LOW |
| vision, eye, blind | Myopia, Hyperopia, Keratitis | Ophthalmologist | LOW |

#### **Error Handling**

```
If any exception occurs during analysis:
  Log error: "Analysis failed, returning fallback response"
  Return fallback response:
  {
    "possibleConditions": ["Unable to determine — please consult a doctor"],
    "recommendedSpecialty": "General Physician",
    "urgency": "LOW",
    "advice": "Please consult a qualified doctor for a proper evaluation.",
    "disclaimer": "This is an AI-generated preliminary suggestion..."
  }
```

---

### **LAYER 5: RETURN RESPONSE**
**Flow**:
```
Symptom Checker Service
  ↓ Return 200 OK + SymptomAnalysisResponse JSON
API Gateway
  ↓ Forward response
Vite Proxy
  ↓ Forward response
React Frontend
  ↓ Receive JSON response
Display Results:
  - Show possible conditions
  - Show recommended specialty
  - Show urgency level (HIGH/MEDIUM/LOW in color)
  - Show advice
  - Show disclaimer
```

---

## 📝 REQUEST/RESPONSE EXAMPLES

### **Successful Request**

```http
POST /api/symptoms/analyze
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "symptoms": "chest pain and shortness of breath"
}
```

### **Successful Response (HIGH Urgency)**

```json
{
  "possibleConditions": [
    "Acute Coronary Syndrome",
    "Angina",
    "Myocarditis"
  ],
  "recommendedSpecialty": "Cardiologist",
  "urgency": "HIGH",
  "advice": "These symptoms may indicate a serious condition. Please seek immediate medical attention at an emergency department or call emergency services.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

### **Successful Response (LOW Urgency)**

```http
POST /api/symptoms/analyze
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "symptoms": "slight itching and rash on arm"
}
```

```json
{
  "possibleConditions": [
    "Allergic Dermatitis",
    "Psoriasis",
    "Eczema"
  ],
  "recommendedSpecialty": "Dermatologist",
  "urgency": "LOW",
  "advice": "Please consult with a qualified physician for proper evaluation. Monitor your symptoms and seek immediate care if they worsen.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

### **Error Responses**

**Missing JWT Token (401)**
```http
HTTP/1.1 401 Unauthorized
{
  "error": "Missing or invalid token"
}
```

**User Not a Patient (403)**
```http
HTTP/1.1 403 Forbidden
{
  "error": "Access Denied: Insufficient permissions"
}
```

**Invalid Symptoms Field (400)**
```http
HTTP/1.1 400 Bad Request
{
  "errors": [
    "Symptoms must be between 3 and 1000 characters"
  ]
}
```

**No Pattern Match (Returns generic response with 200)**
```json
{
  "possibleConditions": [
    "General Medical Evaluation Recommended"
  ],
  "recommendedSpecialty": "General Physician",
  "urgency": "LOW",
  "advice": "Please consult a qualified doctor for a proper evaluation.",
  "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
}
```

---

## 🛠️ WHAT YOU NEED TO IMPLEMENT ON FRONTEND

### **Option 1: Complete Implementation (Recommended)**

Create a new page: `client/src/pages/SymptomChecker.jsx`

```jsx
Import:
- useState for form input
- appointmentService or symptomService for API call
- useEffect for initialization
- Component for displaying results

Structure:
1. Input form with textarea for symptoms
2. Submit button (disabled until symptoms entered)
3. Loading indicator (while calling API)
4. Results display (after response):
   - List of possible conditions
   - Recommended specialty (clickable to search doctors?)
   - Urgency badge (colored: red/HIGH, orange/MEDIUM, green/LOW)
   - Advice text
   - Disclaimer (small text, gray color)
5. Error display (if API fails)
6. CTA buttons:
   - "Book Appointment with Recommended Specialist"
   - "Back to Dashboard"
```

### **Option 2: Modal Integration (Lighter)**

Add to `BookAppointmentModal.jsx`:
- Pre-fill appointment form based on symptom analysis results
- Use same backend endpoint

### **Option 3: Tab in Dashboard**

Add tab in `PatientDashboard.jsx`:
- Dashboard tabs: [My Appointments | Symptom Checker | Medical History]
- Symptom Checker in a tab with same results display

---

## 🔐 SECURITY FEATURES ALREADY IMPLEMENTED

1. ✅ **JWT Token Validation** - API Gateway validates all requests
2. ✅ **Role-Based Access** - Only PATIENT role can use `/api/symptoms/analyze`
3. ✅ **Input Validation** - SymptomRequest validates text length (3-1000 chars)
4. ✅ **Medical Disclaimer** - Always included in response
5. ✅ **Error Handling** - Fallback response on any exception

---

## 🚀 TO START IMPLEMENTING FRONTEND

**Next steps:**
1. Create `client/src/pages/SymptomChecker.jsx` (or Modal)
2. Create `client/src/services/symptomService.js` (optional, or use existing service)
3. Add route in `client/src/App.jsx`:
   ```jsx
   <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
   ```
4. Add link in `PatientDashboard.jsx` to navigate to symptom checker
5. Test with different symptom inputs

---

## 📊 SUMMARY TABLE

| Layer | Component | Port | Status |
|-------|-----------|------|--------|
| Frontend | React Component | 5173 | 📋 TO DO |
| Dev Proxy | Vite | 5173 | ✅ DONE |
| Gateway | API Gateway | 8084 | ✅ DONE |
| Backend | Symptom Checker | 8087 | ✅ DONE |
| Database | None | — | N/A (Stateless) |

---

## ✨ NOTES

- Backend uses **deterministic pattern matching** (not AI API) for instant responses
- No database needed - service is stateless
- 10 medical patterns cover major conditions
- Always includes medical disclaimer for liability protection
- Urgency levels guide patient to appropriate care level
