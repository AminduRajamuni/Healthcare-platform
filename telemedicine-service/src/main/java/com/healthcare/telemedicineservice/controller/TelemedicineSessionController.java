package com.healthcare.telemedicineservice.controller;

import com.healthcare.telemedicineservice.dto.AddSessionNotesRequest;
import com.healthcare.telemedicineservice.dto.CreateSessionRequest;
import com.healthcare.telemedicineservice.dto.TelemedicineSessionDto;
import com.healthcare.telemedicineservice.service.TelemedicineSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class TelemedicineSessionController {

  private final TelemedicineSessionService sessionService;

  // POST /api/sessions : Create a new session for a confirmed appointment
  @PostMapping
  @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
  public ResponseEntity<TelemedicineSessionDto> createSession(@Valid @RequestBody CreateSessionRequest request) {
    TelemedicineSessionDto dto = sessionService.createSession(request);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // GET /api/sessions : List all sessions (admin only)
  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<TelemedicineSessionDto>> getAllSessions() {
    List<TelemedicineSessionDto> sessions = sessionService.getAllSessions();
    return ResponseEntity.ok(sessions);
  }

  // GET /api/sessions/{id} : Get session details
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
  public ResponseEntity<TelemedicineSessionDto> getSessionById(@PathVariable Long id) {
    TelemedicineSessionDto dto = sessionService.getSessionById(id);
    return ResponseEntity.ok(dto);
  }

  // GET /api/sessions/patient/{patientId} : List all sessions for a patient
  @GetMapping("/patient/{patientId}")
  @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
  public ResponseEntity<List<TelemedicineSessionDto>> getSessionsForPatient(@PathVariable Long patientId) {
    List<TelemedicineSessionDto> sessions = sessionService.getSessionsForPatient(patientId);
    return ResponseEntity.ok(sessions);
  }

  // GET /api/sessions/doctor/{doctorId} : List all sessions for a doctor
  @GetMapping("/doctor/{doctorId}")
  @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
  public ResponseEntity<List<TelemedicineSessionDto>> getSessionsForDoctor(@PathVariable Long doctorId) {
    List<TelemedicineSessionDto> sessions = sessionService.getSessionsForDoctor(doctorId);
    return ResponseEntity.ok(sessions);
  }

  // POST /api/sessions/{id}/join : Patient/doctor joins session and receives
  // video link
  @PostMapping("/{id}/join")
  @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
  public ResponseEntity<TelemedicineSessionDto> joinSession(@PathVariable Long id) {
    TelemedicineSessionDto dto = sessionService.joinSession(id);
    return ResponseEntity.ok(dto);
  }

  // POST /api/sessions/{id}/end : Mark session as completed
  @PostMapping("/{id}/end")
  @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
  public ResponseEntity<TelemedicineSessionDto> endSession(@PathVariable Long id) {
    TelemedicineSessionDto dto = sessionService.endSession(id);
    return ResponseEntity.ok(dto);
  }

  // POST /api/sessions/{id}/notes : Add or update session notes
  @PostMapping("/{id}/notes")
  @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
  public ResponseEntity<TelemedicineSessionDto> addNotes(@PathVariable Long id,
      @Valid @RequestBody AddSessionNotesRequest request) {
    TelemedicineSessionDto dto = sessionService.addSessionNotes(id, request);
    return ResponseEntity.ok(dto);
  }
}
