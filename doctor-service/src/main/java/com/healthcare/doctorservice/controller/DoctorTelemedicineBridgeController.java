package com.healthcare.doctorservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.doctorservice.service.DoctorTelemedicineBridgeService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/doctors/{doctorId}/telemedicine/sessions")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR')")
@AllArgsConstructor
public class DoctorTelemedicineBridgeController {

    private final DoctorTelemedicineBridgeService doctorTelemedicineBridgeService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDoctorSessions(@PathVariable("doctorId") Long doctorId) {
        List<Map<String, Object>> sessions = doctorTelemedicineBridgeService.getDoctorSessions(doctorId);
        return new ResponseEntity<>(sessions, HttpStatus.OK);
    }

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<Map<String, Object>> joinSession(@PathVariable("doctorId") Long doctorId,
            @PathVariable("sessionId") Long sessionId) {
        Map<String, Object> session = doctorTelemedicineBridgeService.joinSession(doctorId, sessionId);
        return new ResponseEntity<>(session, HttpStatus.OK);
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<Map<String, Object>> endSession(@PathVariable("doctorId") Long doctorId,
            @PathVariable("sessionId") Long sessionId) {
        Map<String, Object> session = doctorTelemedicineBridgeService.endSession(doctorId, sessionId);
        return new ResponseEntity<>(session, HttpStatus.OK);
    }
}
