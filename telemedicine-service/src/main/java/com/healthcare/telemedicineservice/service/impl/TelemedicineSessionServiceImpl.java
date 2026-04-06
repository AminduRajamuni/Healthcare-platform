package com.healthcare.telemedicineservice.service.impl;

import com.healthcare.telemedicineservice.dto.AddSessionNotesRequest;
import com.healthcare.telemedicineservice.dto.CreateSessionRequest;
import com.healthcare.telemedicineservice.dto.TelemedicineSessionDto;
import com.healthcare.telemedicineservice.entity.SessionStatus;
import com.healthcare.telemedicineservice.entity.TelemedicineSession;
import com.healthcare.telemedicineservice.exception.DuplicateSessionException;
import com.healthcare.telemedicineservice.exception.InvalidSessionStateException;
import com.healthcare.telemedicineservice.exception.ResourceNotFoundException;
import com.healthcare.telemedicineservice.exception.UnauthorizedSessionAccessException;
import com.healthcare.telemedicineservice.repository.TelemedicineSessionRepository;
import com.healthcare.telemedicineservice.security.TelemedicineUserPrincipal;
import com.healthcare.telemedicineservice.service.TelemedicineSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemedicineSessionServiceImpl implements TelemedicineSessionService {

    private final TelemedicineSessionRepository sessionRepository;

  @Value("${telemedicine.jitsi.base-url:https://meet.jit.si}")
  private String jitsiBaseUrl;

      @Override
      public TelemedicineSessionDto createSession(CreateSessionRequest request) {
        log.info("Creating telemedicine session for Appointment ID: {}", request.getAppointmentId());

        if (sessionRepository.existsByAppointmentId(request.getAppointmentId())) {
          log.error("Session already exists for Appointment ID {}", request.getAppointmentId());
          throw new DuplicateSessionException("A telemedicine session already exists for this appointment.");
        }

        String roomName = generateRoomName(request.getAppointmentId(), request.getPatientId());
        String videoLink = jitsiBaseUrl.endsWith("/") ? jitsiBaseUrl + roomName : jitsiBaseUrl + "/" + roomName;

        TelemedicineSession session = TelemedicineSession.builder()
            .appointmentId(request.getAppointmentId())
            .doctorId(request.getDoctorId())
            .patientId(request.getPatientId())
            .scheduledTime(request.getScheduledTime())
            .videoLink(videoLink)
            .status(SessionStatus.SCHEDULED)
            .build();

        session = sessionRepository.save(session);
        log.info("Successfully created telemedicine session with ID: {}", session.getId());

        return mapToDto(session);
      }

      @Override
      public TelemedicineSessionDto getSessionById(Long id) {
        TelemedicineSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
        ensureCanAccessSession(session);
        return mapToDto(session);
      }

      @Override
      public TelemedicineSessionDto getSessionByAppointmentId(Long appointmentId) {
        TelemedicineSession session = sessionRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found for Appointment ID: " + appointmentId));
        ensureCanAccessSession(session);
        return mapToDto(session);
      }

      @Override
      public List<TelemedicineSessionDto> getSessionsForPatient(Long patientId) {
        TelemedicineUserPrincipal currentUser = getCurrentUser();
        if (currentUser != null && "PATIENT".equalsIgnoreCase(currentUser.getRole())) {
          if (currentUser.getId() == null || !currentUser.getId().equals(patientId)) {
            throw new UnauthorizedSessionAccessException("You are not allowed to access sessions of another patient");
          }
        }
        return sessionRepository.findByPatientId(patientId).stream()
            .map(this::mapToDto)
            .toList();
      }

      @Override
      public List<TelemedicineSessionDto> getSessionsForDoctor(Long doctorId) {
        TelemedicineUserPrincipal currentUser = getCurrentUser();
        if (currentUser != null && "DOCTOR".equalsIgnoreCase(currentUser.getRole())) {
          if (currentUser.getId() == null || !currentUser.getId().equals(doctorId)) {
            throw new UnauthorizedSessionAccessException("You are not allowed to access sessions of another doctor");
          }
        }
        return sessionRepository.findByDoctorId(doctorId).stream()
            .map(this::mapToDto)
            .toList();
      }

      @Override
      public TelemedicineSessionDto joinSession(Long sessionId) {
        TelemedicineSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        TelemedicineUserPrincipal currentUser = getCurrentUser();
        if (currentUser == null) {
          throw new UnauthorizedSessionAccessException("Authentication required to join session");
        }

        String role = currentUser.getRole();
        Long userId = currentUser.getId();

        if ("PATIENT".equalsIgnoreCase(role)) {
          if (userId == null || !session.getPatientId().equals(userId)) {
            throw new UnauthorizedSessionAccessException("Patient is not assigned to this session");
          }
        } else if ("DOCTOR".equalsIgnoreCase(role)) {
          if (userId == null || !session.getDoctorId().equals(userId)) {
            throw new UnauthorizedSessionAccessException("Doctor is not assigned to this session");
          }
        }
        // ADMIN can join any session

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
          throw new InvalidSessionStateException("Cannot join a session that is " + session.getStatus());
        }

        if (session.getStartTime() == null) {
          // First participant joining
          session.setStartTime(LocalDateTime.now());
          session.setStatus(SessionStatus.ONGOING);
        }

        TelemedicineSession updated = sessionRepository.save(session);
        return mapToDto(updated);
      }

      @Override
      public TelemedicineSessionDto endSession(Long sessionId) {
        TelemedicineSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        TelemedicineUserPrincipal currentUser = getCurrentUser();
        if (currentUser == null) {
          throw new UnauthorizedSessionAccessException("Authentication required to end session");
        }
        String role = currentUser.getRole();
        Long userId = currentUser.getId();

        if ("DOCTOR".equalsIgnoreCase(role)) {
          if (userId == null || !session.getDoctorId().equals(userId)) {
            throw new UnauthorizedSessionAccessException("Doctor is not assigned to this session");
          }
        } else if (!"ADMIN".equalsIgnoreCase(role)) {
          throw new UnauthorizedSessionAccessException("Only the assigned doctor or an admin can end the session");
        }

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
          throw new InvalidSessionStateException("Session is already " + session.getStatus());
        }

        session.setEndTime(LocalDateTime.now());
        session.setStatus(SessionStatus.COMPLETED);
        TelemedicineSession updated = sessionRepository.save(session);
        return mapToDto(updated);
      }

      @Override
      public TelemedicineSessionDto addSessionNotes(Long sessionId, AddSessionNotesRequest request) {
        TelemedicineSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        TelemedicineUserPrincipal currentUser = getCurrentUser();
        if (currentUser == null) {
          throw new UnauthorizedSessionAccessException("Authentication required to add notes");
        }

        String role = currentUser.getRole();
        Long userId = currentUser.getId();

        if ("DOCTOR".equalsIgnoreCase(role)) {
          if (userId == null || !session.getDoctorId().equals(userId)) {
            throw new UnauthorizedSessionAccessException("Doctor is not assigned to this session");
          }
        } else if (!"ADMIN".equalsIgnoreCase(role)) {
          throw new UnauthorizedSessionAccessException("Only the assigned doctor or an admin can add notes");
        }

        if (session.getStatus() == SessionStatus.SCHEDULED) {
          throw new InvalidSessionStateException("Cannot add notes to a session that has not started yet");
        }

        session.setNotes(request.getNotes());
        TelemedicineSession updated = sessionRepository.save(session);
        return mapToDto(updated);
      }

      private String generateRoomName(Long appointmentId, Long patientId) {
        String random = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 8);
        return "telemed-" + appointmentId + "-p" + patientId + "-" + random;
      }

      private TelemedicineUserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof TelemedicineUserPrincipal principal) {
          return principal;
        }
        return null;
      }

      private void ensureCanAccessSession(TelemedicineSession session) {
        TelemedicineUserPrincipal currentUser = getCurrentUser();
        if (currentUser == null) {
          throw new UnauthorizedSessionAccessException("Authentication required to access session");
        }

        String role = currentUser.getRole();
        Long userId = currentUser.getId();

        if ("PATIENT".equalsIgnoreCase(role)) {
          if (userId == null || !session.getPatientId().equals(userId)) {
            throw new UnauthorizedSessionAccessException("You are not allowed to access this session");
          }
        } else if ("DOCTOR".equalsIgnoreCase(role)) {
          if (userId == null || !session.getDoctorId().equals(userId)) {
            throw new UnauthorizedSessionAccessException("You are not allowed to access this session");
          }
        }
        // ADMIN can access any session
      }

      private TelemedicineSessionDto mapToDto(TelemedicineSession session) {
        return TelemedicineSessionDto.builder()
            .id(session.getId())
            .appointmentId(session.getAppointmentId())
            .doctorId(session.getDoctorId())
            .patientId(session.getPatientId())
            .scheduledTime(session.getScheduledTime())
            .startTime(session.getStartTime())
            .endTime(session.getEndTime())
            .videoLink(session.getVideoLink())
            .status(session.getStatus())
            .notes(session.getNotes())
            .build();
      }
}
