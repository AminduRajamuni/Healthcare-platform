package com.healthcare.doctorservice.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.healthcare.doctorservice.dto.IssuePrescriptionRequest;
import com.healthcare.doctorservice.entity.Doctor;
import com.healthcare.doctorservice.exception.PatientNotFoundException;
import com.healthcare.doctorservice.exception.PatientServiceException;
import com.healthcare.doctorservice.exception.ResourceNotFoundException;
import com.healthcare.doctorservice.repository.DoctorRepository;
import com.healthcare.doctorservice.service.DoctorPrescriptionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorPrescriptionServiceImpl implements DoctorPrescriptionService {

    private static final String PATIENT_SERVICE_BASE_URL = "http://patient-service:8080/api/patients";

    private final DoctorRepository doctorRepository;
    private final RestTemplate restTemplate;

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> issuePrescription(Long doctorId, Long patientId, IssuePrescriptionRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        Map<String, Object> patientServiceRequest = new HashMap<>();
        patientServiceRequest.put("doctorName", doctor.getName());
        patientServiceRequest.put("medicine", request.getMedicine());
        patientServiceRequest.put("dosage", request.getDosage());
        patientServiceRequest.put("date", request.getDate());

        String prescriptionUrl = PATIENT_SERVICE_BASE_URL + "/" + patientId + "/prescriptions";

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(prescriptionUrl, patientServiceRequest, Map.class);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new PatientNotFoundException("Patient not found with ID: " + patientId);
        } catch (HttpClientErrorException ex) {
            throw new PatientServiceException(
                    "patient-service rejected prescription request with status " + ex.getStatusCode() + ".");
        } catch (ResourceAccessException ex) {
            throw new PatientServiceException(
                    "Unable to reach patient-service while issuing prescription for patient " + patientId + ".");
        } catch (RestClientException ex) {
            throw new PatientServiceException(
                    "Failed to issue prescription via patient-service for patient " + patientId + ".");
        }
    }
}
