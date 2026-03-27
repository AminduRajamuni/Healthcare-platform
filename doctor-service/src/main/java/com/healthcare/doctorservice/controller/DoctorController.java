package com.healthcare.doctorservice.controller;

import com.healthcare.doctorservice.entity.Doctor;
import com.healthcare.doctorservice.service.DoctorService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<Doctor> getDoctorById(@PathVariable("id") Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    // Build Get All Doctors REST API
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    // Build Update Doctor REST API
    @PutMapping("{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable("id") Long doctorId,
                                               @Valid @RequestBody Doctor doctor) {
        Doctor updatedDoctor = doctorService.updateDoctor(doctor, doctorId);
        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    // Build Patch Doctor Availability REST API
    @PatchMapping("{id}/availability")
    public ResponseEntity<Doctor> updateDoctorAvailability(@PathVariable("id") Long doctorId,
                                                           @RequestBody Map<String, Boolean> request) {
        Boolean isAvailable = request.get("isAvailable");
        Doctor updatedDoctor = doctorService.updateDoctorAvailability(doctorId, isAvailable);
        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    // Build Delete Doctor REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable("id") Long doctorId) {
        doctorService.deleteDoctor(doctorId);
        return new ResponseEntity<>("Doctor successfully deleted!", HttpStatus.OK);
    }
}
