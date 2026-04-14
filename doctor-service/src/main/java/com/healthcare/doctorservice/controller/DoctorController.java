package com.healthcare.doctorservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.doctorservice.entity.Doctor;
import com.healthcare.doctorservice.service.DoctorService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@AllArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // Build Add Doctor REST API
    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@Valid @RequestBody Doctor doctor) {
        Doctor savedDoctor = doctorService.addDoctor(doctor);
        return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED);
    }

    // Build Get Doctor By ID REST API
    @GetMapping("{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable("id") Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    // Build Get All Doctors REST API
    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    // Build Search Doctors REST API
    @GetMapping("/search")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<List<Doctor>> searchDoctors(@RequestParam("specialization") String specialization,
            @RequestParam("isAvailable") Boolean isAvailable,
            @RequestParam(value = "name", required = false) String name) {
        List<Doctor> doctors = doctorService.searchDoctors(specialization, isAvailable, name);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    // Build Update Doctor REST API
    @PutMapping("{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and #doctorId.toString().equals(authentication.principal))")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable("id") Long doctorId,
            @Valid @RequestBody Doctor doctor) {
        Doctor updatedDoctor = doctorService.updateDoctor(doctor, doctorId);
        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    // Build Patch Doctor Availability REST API
    @PatchMapping("{id}/availability")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and #doctorId.toString().equals(authentication.principal))")
    public ResponseEntity<Doctor> updateDoctorAvailability(@PathVariable("id") Long doctorId,
            @RequestBody Map<String, Boolean> request) {
        Boolean isAvailable = request.get("isAvailable");
        Doctor updatedDoctor = doctorService.updateDoctorAvailability(doctorId, isAvailable);
        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    // Build Verify Doctor REST API
    @PutMapping("{id}/verify")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> verifyDoctor(@PathVariable("id") Long doctorId) {
        Doctor verifiedDoctor = doctorService.verifyDoctor(doctorId);
        return new ResponseEntity<>(verifiedDoctor, HttpStatus.OK);
    }

    // Build Get Unverified Doctors REST API
    @GetMapping("unverified")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Doctor>> getUnverifiedDoctors() {
        List<Doctor> unverifiedDoctors = doctorService.getUnverifiedDoctors();
        return new ResponseEntity<>(unverifiedDoctors, HttpStatus.OK);
    }

    // Build Delete Doctor REST API
    @DeleteMapping("{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteDoctor(@PathVariable("id") Long doctorId) {
        doctorService.deleteDoctor(doctorId);
        return new ResponseEntity<>("Doctor successfully deleted!", HttpStatus.OK);
    }
}
