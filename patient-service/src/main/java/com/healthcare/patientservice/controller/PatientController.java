package com.healthcare.patientservice.controller;

import com.healthcare.patientservice.entity.Patient;
import com.healthcare.patientservice.service.PatientService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@AllArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // Build Register Patient REST API
    @PostMapping
    public ResponseEntity<Patient> registerPatient(@Valid @RequestBody Patient patient) {
        Patient savedPatient = patientService.registerPatient(patient);
        return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
    }

    // Build Get Patient By ID REST API
    @GetMapping("{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable("id") Long patientId) {
        Patient patient = patientService.getPatientById(patientId);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    // Build Get All Patients REST API
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    // Build Update Patient REST API
    @PutMapping("{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable("id") Long patientId,
                                                 @Valid @RequestBody Patient patient) {
        Patient updatedPatient = patientService.updatePatient(patient, patientId);
        return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
    }

    // Build Delete Patient REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String> deletePatient(@PathVariable("id") Long patientId) {
        patientService.deletePatient(patientId);
        return new ResponseEntity<>("Patient successfully deleted!", HttpStatus.OK);
    }

    // Build Login REST API
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody com.healthcare.patientservice.dto.LoginDto loginDto) {
        String response = patientService.login(loginDto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
