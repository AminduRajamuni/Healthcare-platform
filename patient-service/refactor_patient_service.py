import re

def strip_patient_controller():
    file_path = "src/main/java/com/healthcare/patientservice/controller/PatientController.java"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove PreAuthorize lines
    lines = content.split('\n')
    lines = [line for line in lines if "PreAuthorize" not in line]
    content = '\n'.join(lines)
    
    # Remove login block
    login_pattern = r"\s*// Login and get JWT token\s*@PostMapping\(\"/login\"\)\s*public ResponseEntity<AuthResponseDto> login.*?\n\s*return new ResponseEntity<\>\(response, HttpStatus\.OK\);\s*\}"
    content = re.sub(login_pattern, "", content, flags=re.DOTALL)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

def strip_patient_service_impl():
    file_path = "src/main/java/com/healthcare/patientservice/service/impl/PatientServiceImpl.java"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove security imports
    security_imports = [
        "import org.springframework.security.",
        "import com.healthcare.patientservice.security."
    ]
    lines = content.split('\n')
    lines = [line for line in lines if not any(line.startswith(imp) for imp in security_imports)]
    
    # Remove ensureCanAccessPatient calls explicitly
    lines = [line for line in lines if "ensureCanAccessPatient(patientId);" not in line]
    
    content = '\n'.join(lines)
    
    # Replace password encoder in register
    content = content.replace("patient.setPassword(passwordEncoder.encode(request.getPassword()));", "patient.setPassword(request.getPassword());")
    
    # Remove PasswordEncoder and JwtTokenProvider fields
    content = re.sub(r"\s*private final PasswordEncoder passwordEncoder;", "", content)
    content = re.sub(r"\s*private final JwtTokenProvider jwtTokenProvider;", "", content)
    
    # Remove login method
    login_pattern = r"\s*@Override\s*public AuthResponseDto login\(LoginRequest loginRequest\) \{.*?\s*return response;\s*\}"
    content = re.sub(login_pattern, "", content, flags=re.DOTALL)
    
    # Remove ensureCanAccessPatient method definition
    ensure_pattern = r"\s*private void ensureCanAccessPatient\(Long pathPatientId\) \{.*?\s*\}"
    content = re.sub(ensure_pattern, "", content, flags=re.DOTALL)
    
    # Remove JWT token logic in getVideoLink
    jwt_block = r"\s*// Build an internal JWT for service-to-service call.*?headers\.setBearerAuth\(serviceToken\);"
    content = re.sub(jwt_block, "", content, flags=re.DOTALL)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    strip_patient_controller()
    strip_patient_service_impl()
    print("Refactoring complete.")
