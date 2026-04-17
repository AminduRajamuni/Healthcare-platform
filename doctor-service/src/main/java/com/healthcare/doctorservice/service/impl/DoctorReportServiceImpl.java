package com.healthcare.doctorservice.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.healthcare.doctorservice.exception.PatientServiceException;
import com.healthcare.doctorservice.exception.PatientServicePassThroughException;
import com.healthcare.doctorservice.exception.ResourceNotFoundException;
import com.healthcare.doctorservice.repository.DoctorRepository;
import com.healthcare.doctorservice.service.DoctorReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorReportServiceImpl implements DoctorReportService {

    private static final String PATIENT_SERVICE_BASE_URL = "http://patient-service:8080/api/patients";

    private final DoctorRepository doctorRepository;
    private final RestTemplate restTemplate;

    @Override
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getPatientReports(Long doctorId, Long patientId) {
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        String reportsUrl = PATIENT_SERVICE_BASE_URL + "/" + patientId + "/reports";

        try {
            ResponseEntity<List> response = restTemplate.getForEntity(reportsUrl, List.class);
            List<Map<String, Object>> reports = response.getBody();
            return reports == null ? List.of() : reports;
        } catch (HttpStatusCodeException ex) {
            String downstreamBody = ex.getResponseBodyAsString();
            String message = (downstreamBody == null || downstreamBody.isBlank())
                    ? "patient-service returned status " + ex.getStatusCode() + " while fetching reports."
                    : downstreamBody;
            throw new PatientServicePassThroughException(ex.getStatusCode(), message);
        } catch (ResourceAccessException ex) {
            throw new PatientServiceException(
                    "Unable to reach patient-service while fetching reports for patient " + patientId + ".");
        } catch (RestClientException ex) {
            throw new PatientServiceException(
                    "Failed to fetch reports from patient-service for patient " + patientId + ".");
        }
    }
}
