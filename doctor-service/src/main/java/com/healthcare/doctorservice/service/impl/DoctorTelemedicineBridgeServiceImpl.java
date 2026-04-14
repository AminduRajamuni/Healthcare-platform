package com.healthcare.doctorservice.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.healthcare.doctorservice.exception.ResourceNotFoundException;
import com.healthcare.doctorservice.exception.TelemedicineServiceException;
import com.healthcare.doctorservice.exception.TelemedicineServicePassThroughException;
import com.healthcare.doctorservice.repository.DoctorRepository;
import com.healthcare.doctorservice.service.DoctorTelemedicineBridgeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorTelemedicineBridgeServiceImpl implements DoctorTelemedicineBridgeService {

    private static final String TELEMEDICINE_SERVICE_BASE_URL = "http://localhost:8085/api/sessions";

    private final DoctorRepository doctorRepository;
    private final RestTemplate restTemplate;

    @Override
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getDoctorSessions(Long doctorId) {
        ensureDoctorExists(doctorId);

        String url = TELEMEDICINE_SERVICE_BASE_URL + "/doctor/" + doctorId;
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            List<Map<String, Object>> sessions = response.getBody();
            return sessions == null ? List.of() : sessions;
        } catch (HttpStatusCodeException ex) {
            throw buildPassThroughException(ex, "listing sessions for doctor " + doctorId);
        } catch (ResourceAccessException ex) {
            throw new TelemedicineServiceException(
                    "Unable to reach telemedicine-service while listing sessions for doctor " + doctorId + ".");
        } catch (RestClientException ex) {
            throw new TelemedicineServiceException(
                    "Failed to list sessions from telemedicine-service for doctor " + doctorId + ".");
        }
    }

    @Override
    public Map<String, Object> joinSession(Long doctorId, Long sessionId) {
        ensureDoctorExists(doctorId);
        Map<String, Object> session = getSessionById(sessionId);
        validateSessionDoctor(session, doctorId, sessionId);
        return postSessionAction(sessionId, "join");
    }

    @Override
    public Map<String, Object> endSession(Long doctorId, Long sessionId) {
        ensureDoctorExists(doctorId);
        Map<String, Object> session = getSessionById(sessionId);
        validateSessionDoctor(session, doctorId, sessionId);
        return postSessionAction(sessionId, "end");
    }

    private void ensureDoctorExists(Long doctorId) {
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getSessionById(Long sessionId) {
        String url = TELEMEDICINE_SERVICE_BASE_URL + "/" + sessionId;
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            throw buildPassThroughException(ex, "fetching session " + sessionId);
        } catch (ResourceAccessException ex) {
            throw new TelemedicineServiceException(
                    "Unable to reach telemedicine-service while fetching session " + sessionId + ".");
        } catch (RestClientException ex) {
            throw new TelemedicineServiceException(
                    "Failed to fetch session " + sessionId + " from telemedicine-service.");
        }
    }

    private void validateSessionDoctor(Map<String, Object> session, Long doctorId, Long sessionId) {
        if (session == null || session.get("doctorId") == null) {
            throw new TelemedicineServiceException(
                    "telemedicine-service returned an invalid response for session " + sessionId + ".");
        }

        Object doctorIdValue = session.get("doctorId");
        if (!(doctorIdValue instanceof Number)) {
            throw new TelemedicineServiceException(
                    "telemedicine-service returned an unexpected doctorId type for session " + sessionId + ".");
        }

        long sessionDoctorId = ((Number) doctorIdValue).longValue();
        if (sessionDoctorId != doctorId) {
            throw new IllegalArgumentException(
                    "Session " + sessionId + " does not belong to doctor " + doctorId + ".");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> postSessionAction(Long sessionId, String action) {
        String url = TELEMEDICINE_SERVICE_BASE_URL + "/" + sessionId + "/" + action;
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
            Map<String, Object> body = response.getBody();
            return body == null ? Map.of() : body;
        } catch (HttpStatusCodeException ex) {
            throw buildPassThroughException(ex, action + "ing session " + sessionId);
        } catch (ResourceAccessException ex) {
            throw new TelemedicineServiceException(
                    "Unable to reach telemedicine-service while " + action + "ing session " + sessionId + ".");
        } catch (RestClientException ex) {
            throw new TelemedicineServiceException(
                    "Failed to complete action " + action + " for session " + sessionId + " via telemedicine-service.");
        }
    }

    private TelemedicineServicePassThroughException buildPassThroughException(HttpStatusCodeException ex,
            String operation) {
        String downstreamBody = ex.getResponseBodyAsString();
        String message = (downstreamBody == null || downstreamBody.isBlank())
                ? "telemedicine-service returned status " + ex.getStatusCode() + " while " + operation + "."
                : downstreamBody;
        return new TelemedicineServicePassThroughException(ex.getStatusCode(), message);
    }
}
