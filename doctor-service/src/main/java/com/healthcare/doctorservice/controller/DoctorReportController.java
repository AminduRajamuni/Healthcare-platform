package com.healthcare.doctorservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.doctorservice.service.DoctorReportService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/doctors/{doctorId}/patients/{patientId}/reports")
@AllArgsConstructor
public class DoctorReportController {

    private final DoctorReportService doctorReportService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPatientReports(@PathVariable("doctorId") Long doctorId,
            @PathVariable("patientId") Long patientId) {
        List<Map<String, Object>> reports = doctorReportService.getPatientReports(doctorId, patientId);
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }
}
