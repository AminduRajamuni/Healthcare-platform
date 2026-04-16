package com.healthcare.notificationservice.client;

import com.healthcare.notificationservice.dto.DoctorDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorClient {

    private final RestTemplate restTemplate;

    public String getDoctorName(Long doctorId) {
        log.info("Fetching name for doctor ID: {}", doctorId);
        try {
            DoctorDto doctorDto = restTemplate.getForObject(
                    "http://doctor-service:8081/api/doctors/" + doctorId, 
                    DoctorDto.class
            );
            
            if (doctorDto != null && doctorDto.getName() != null && !doctorDto.getName().isEmpty()) {
                log.info("Successfully fetched name {} for doctor ID: {}", doctorDto.getName(), doctorId);
                return doctorDto.getName();
            } else {
                log.warn("Doctor API returned success but name is null/empty. Using fallback.");
            }
        } catch (Exception e) {
            log.error("Error communicating with Doctor Service for doctor ID {}: {}. Falling back to default ID string.", doctorId, e.getMessage());
        }
        
        // Return standard ID text as robust fallback so email rendering never crashes completely
        return "Doctor ID " + doctorId; 
    }
}
