package com.healthcare.notificationservice.client;

import com.healthcare.notificationservice.dto.PatientDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientClient {

    private final RestTemplate restTemplate;

    public String getPatientEmail(Long patientId) {
        log.info("Fetching email for patient ID: {}", patientId);
        try {
            PatientDto patientDto = restTemplate.getForObject(
                    "http://patient-service:8080/api/patients/" + patientId, 
                    PatientDto.class
            );
            
            if (patientDto != null && patientDto.getEmail() != null && !patientDto.getEmail().isEmpty()) {
                log.info("Successfully fetched email {} for patient ID: {}", patientDto.getEmail(), patientId);
                return patientDto.getEmail();
            } else {
                log.warn("Patient API returned success but email is null/empty. Using fallback.");
            }
        } catch (Exception e) {
            log.error("Error communicating with Patient Service for patient ID {}: {}. Falling back to default email.", patientId, e.getMessage());
        }
        
        // Return your personal email as the fallback so it never crashes!
        return "amindurajamuni@gmail.com"; 
    }
}
