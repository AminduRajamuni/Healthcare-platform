package com.healthcare.doctorservice.service.impl;

import java.util.Map;

import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.healthcare.doctorservice.exception.DownstreamServiceException;
import com.healthcare.doctorservice.exception.InvalidDecisionException;
import com.healthcare.doctorservice.exception.ResourceNotFoundException;
import com.healthcare.doctorservice.repository.DoctorRepository;
import com.healthcare.doctorservice.service.DoctorAppointmentDecisionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorAppointmentDecisionServiceImpl implements DoctorAppointmentDecisionService {

    private static final String APPOINTMENT_SERVICE_BASE_URL = "http://localhost:8082/api/appointments";

    private final DoctorRepository doctorRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Map<String, Object> decideAppointment(Long doctorId, Long appointmentId, String decision) {
        validateDoctorExists(doctorId);

        String status = mapDecisionToStatus(decision);
        Map<String, Object> appointment = getAppointment(appointmentId);
        validateAppointmentDoctor(appointment, doctorId, appointmentId);

        return updateAppointmentStatus(appointmentId, status);
    }

    private void validateDoctorExists(Long doctorId) {
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
    }

    private String mapDecisionToStatus(String decision) {
        if (decision == null || decision.trim().isEmpty()) {
            throw new InvalidDecisionException("Decision is required and must be either ACCEPT or REJECT.");
        }

        String normalizedDecision = decision.trim().toUpperCase();
        if ("ACCEPT".equals(normalizedDecision)) {
            return "ACCEPTED";
        }
        if ("REJECT".equals(normalizedDecision)) {
            return "REJECTED";
        }

        throw new InvalidDecisionException("Invalid decision. Allowed values are ACCEPT or REJECT.");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getAppointment(Long appointmentId) {
        try {
            ResponseEntity<Map> appointmentResponse = restTemplate.getForEntity(
                    APPOINTMENT_SERVICE_BASE_URL + "/" + appointmentId,
                    Map.class);
            return appointmentResponse.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Appointment", "id", appointmentId);
        } catch (ResourceAccessException ex) {
            throw new DownstreamServiceException(
                    "Unable to reach appointment-service while fetching appointment " + appointmentId + ".");
        } catch (RestClientException ex) {
            throw new DownstreamServiceException(
                    "Failed to fetch appointment " + appointmentId + " from appointment-service.");
        }
    }

    private void validateAppointmentDoctor(Map<String, Object> appointment,
                                           Long doctorId,
                                           Long appointmentId) {
        if (appointment == null || appointment.get("doctorId") == null) {
            throw new DownstreamServiceException(
                    "appointment-service returned an invalid response for appointment " + appointmentId + ".");
        }

        Object appointmentDoctorIdValue = appointment.get("doctorId");
        if (!(appointmentDoctorIdValue instanceof Number)) {
            throw new DownstreamServiceException(
                    "appointment-service returned an unexpected doctorId type for appointment " + appointmentId + ".");
        }

        long appointmentDoctorId = ((Number) appointmentDoctorIdValue).longValue();
        if (appointmentDoctorId != doctorId) {
            throw new IllegalArgumentException(
                    "Appointment " + appointmentId + " does not belong to doctor " + doctorId + ".");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> updateAppointmentStatus(Long appointmentId, String status) {
        try {
            String updateUrl = APPOINTMENT_SERVICE_BASE_URL + "/" + appointmentId + "/status?status=" + status;
            ResponseEntity<Map> updateResponse = restTemplate.exchange(updateUrl, HttpMethod.PUT, null, Map.class);
            return updateResponse.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Appointment", "id", appointmentId);
        } catch (ResourceAccessException ex) {
            throw new DownstreamServiceException(
                    "Unable to reach appointment-service while updating appointment " + appointmentId + " status.");
        } catch (RestClientException ex) {
            throw new DownstreamServiceException(
                    "Failed to update appointment " + appointmentId + " status in appointment-service.");
        }
    }
}