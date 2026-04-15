package com.healthcare.patientservice.controller;

import com.healthcare.patientservice.dto.LoginRequest;
import com.healthcare.patientservice.entity.Patient;
import com.healthcare.patientservice.repository.PatientRepository;
import com.healthcare.patientservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PatientRepository patientRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Optional<Patient> optionalPatient = patientRepository.findByEmailAndDeletedFalse(request.getEmail());

        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            // In a real application, use a PasswordEncoder
            if (patient.getPassword().equals(request.getPassword())) {
                String token = jwtService.generateToken(patient.getEmail(), patient.getId(), patient.getRole().name());
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("role", patient.getRole().name());
                response.put("id", patient.getId().toString());
                response.put("firstName", patient.getFirstName());
                response.put("email", patient.getEmail());
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        }
        
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
