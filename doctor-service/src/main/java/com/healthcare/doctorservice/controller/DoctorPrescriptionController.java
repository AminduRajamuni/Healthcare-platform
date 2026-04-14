package com.healthcare.doctorservice.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.doctorservice.dto.IssuePrescriptionRequest;
import com.healthcare.doctorservice.service.DoctorPrescriptionService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/doctors/{doctorId}/patients/{patientId}/prescriptions")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR')")
@AllArgsConstructor
public class DoctorPrescriptionController {

    private final DoctorPrescriptionService doctorPrescriptionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> issuePrescription(@PathVariable("doctorId") Long doctorId,
            @PathVariable("patientId") Long patientId,
            @Valid @RequestBody IssuePrescriptionRequest request) {
        Map<String, Object> issuedPrescription = doctorPrescriptionService.issuePrescription(doctorId, patientId,
                request);
        return new ResponseEntity<>(issuedPrescription, HttpStatus.CREATED);
    }
}
