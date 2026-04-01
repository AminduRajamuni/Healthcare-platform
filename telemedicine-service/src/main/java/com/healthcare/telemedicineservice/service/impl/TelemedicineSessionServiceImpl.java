package com.healthcare.telemedicineservice.service.impl;

import com.healthcare.telemedicineservice.dto.CreateSessionRequest;
import com.healthcare.telemedicineservice.dto.TelemedicineSessionDto;
import com.healthcare.telemedicineservice.entity.SessionStatus;
import com.healthcare.telemedicineservice.entity.TelemedicineSession;
import com.healthcare.telemedicineservice.exception.DuplicateSessionException;
import com.healthcare.telemedicineservice.exception.ResourceNotFoundException;
import com.healthcare.telemedicineservice.repository.TelemedicineSessionRepository;
import com.healthcare.telemedicineservice.service.TelemedicineSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemedicineSessionServiceImpl implements TelemedicineSessionService {

    private final TelemedicineSessionRepository sessionRepository;

    @Override
    public TelemedicineSessionDto createSession(CreateSessionRequest request) {
        log.info("Creating telemedicine session for Appointment ID: {}", request.getAppointmentId());

        if (sessionRepository.existsByAppointmentId(request.getAppointmentId())) {
            log.error("Session already exists for Appointment ID {}", request.getAppointmentId());
            throw new DuplicateSessionException("A telemedicine session already exists for this appointment.");
        }

        String meetingLink = "https://meet.jit.si/appointment-" + request.getAppointmentId();

        TelemedicineSession session = TelemedicineSession.builder()
                .appointmentId(request.getAppointmentId())
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .meetingLink(meetingLink)
                .status(SessionStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .build();

        session = sessionRepository.save(session);
        log.info("Successfully created telemedicine session with ID: {}", session.getId());

        return TelemedicineSessionDto.builder()
                .id(session.getId())
                .meetingLink(session.getMeetingLink())
                .status(session.getStatus())
                .build();
    }

    @Override
    public TelemedicineSession getSessionById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
    }

    @Override
    public TelemedicineSession getSessionByAppointmentId(Long appointmentId) {
        return sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found for Appointment ID: " + appointmentId));
    }

    @Override
    public TelemedicineSession updateSessionStatus(Long id, String status) {
        TelemedicineSession session = getSessionById(id);
        
        try {
            session.setStatus(SessionStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Allowed values: SCHEDULED, ACTIVE, COMPLETED");
        }
        
        return sessionRepository.save(session);
    }
}
