package com.healthcare.doctorservice.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.doctorservice.service.DoctorAppointmentDecisionService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/doctors/{doctorId}/appointments")
@AllArgsConstructor
public class DoctorAppointmentDecisionController {

    private final DoctorAppointmentDecisionService doctorAppointmentDecisionService;

    @PutMapping("{appointmentId}/decision")
    public ResponseEntity<Map<String, Object>> decideAppointment(@PathVariable("doctorId") Long doctorId,
                                                                 @PathVariable("appointmentId") Long appointmentId,
                                                                 @RequestBody Map<String, String> request) {
        String decision = request == null ? null : request.get("decision");
        Map<String, Object> updatedAppointment = doctorAppointmentDecisionService.decideAppointment(
                doctorId,
                appointmentId,
                decision);
        return new ResponseEntity<>(updatedAppointment, HttpStatus.OK);
    }
}