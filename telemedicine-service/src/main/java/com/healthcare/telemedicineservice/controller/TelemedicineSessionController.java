package com.healthcare.telemedicineservice.controller;

import com.healthcare.telemedicineservice.dto.CreateSessionRequest;
import com.healthcare.telemedicineservice.dto.TelemedicineSessionDto;
import com.healthcare.telemedicineservice.entity.TelemedicineSession;
import com.healthcare.telemedicineservice.service.TelemedicineSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telemedicine/session")
@RequiredArgsConstructor
public class TelemedicineSessionController {

    private final TelemedicineSessionService sessionService;

    @PostMapping
    public ResponseEntity<TelemedicineSessionDto> createSession(@RequestBody CreateSessionRequest request) {
        return new ResponseEntity<>(sessionService.createSession(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TelemedicineSession> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<TelemedicineSession> getSessionByAppointmentId(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(sessionService.getSessionByAppointmentId(appointmentId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TelemedicineSession> updateSessionStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        return ResponseEntity.ok(sessionService.updateSessionStatus(id, status));
    }
}
