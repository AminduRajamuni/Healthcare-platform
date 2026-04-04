package com.healthcare.patientservice.controller;

import com.healthcare.patientservice.dto.*;
import com.healthcare.patientservice.service.PatientService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@AllArgsConstructor
public class PatientController {

  private final PatientService patientService;

  // Register Patient
  @PostMapping("/register")
  public ResponseEntity<PatientProfileDto> registerPatient(@Valid @RequestBody RegisterPatientRequest request) {
    PatientProfileDto savedPatient = patientService.registerPatient(request);
    return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
  }

  // Login and get JWT token
  @PostMapping("/login")
  public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequest loginRequest) {
    AuthResponseDto response = patientService.login(loginRequest);
    return new ResponseEntity<>(response, HttpStatus.OK);
  }

  // Get Patient By ID (secured)
  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId == principal.id)")
  public ResponseEntity<PatientProfileDto> getPatientById(@PathVariable("id") Long patientId) {
    PatientProfileDto patient = patientService.getPatientById(patientId);
    return new ResponseEntity<>(patient, HttpStatus.OK);
  }

  // Get All Patients (admin only)
  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<PatientListItemDto>> getAllPatients() {
    List<PatientListItemDto> patients = patientService.getAllPatients();
    return new ResponseEntity<>(patients, HttpStatus.OK);
  }

  // Update Patient (secured)
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId == principal.id)")
  public ResponseEntity<PatientProfileDto> updatePatient(@PathVariable("id") Long patientId,
                             @Valid @RequestBody UpdatePatientRequest request) {
    PatientProfileDto updatedPatient = patientService.updatePatient(patientId, request);
    return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
  }

  // Delete Patient (secured - admin only for safety)
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<String> deletePatient(@PathVariable("id") Long patientId) {
    patientService.deletePatient(patientId);
    return new ResponseEntity<>("Patient successfully deleted!", HttpStatus.OK);
  }

  // Get Medical History (patient/admin/doctor)
  @GetMapping("/{id}/medical-history")
  @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId == principal.id)")
  public ResponseEntity<List<MedicalHistoryDto>> getMedicalHistory(@PathVariable("id") Long patientId) {
    List<MedicalHistoryDto> history = patientService.getMedicalHistory(patientId);
    return new ResponseEntity<>(history, HttpStatus.OK);
  }

  // Add Medical History (doctor/admin)
  @PostMapping("/{id}/medical-history")
  @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
  public ResponseEntity<MedicalHistoryDto> addMedicalHistory(@PathVariable("id") Long patientId,
                              @Valid @RequestBody CreateMedicalHistoryRequest request) {
    MedicalHistoryDto dto = patientService.addMedicalHistory(patientId, request);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // Get Prescriptions (patient/admin/doctor)
  @GetMapping("/{id}/prescriptions")
  @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId == principal.id)")
  public ResponseEntity<List<PrescriptionDto>> getPrescriptions(@PathVariable("id") Long patientId) {
    List<PrescriptionDto> list = patientService.getPrescriptions(patientId);
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  // Add Prescription (doctor/admin)
  @PostMapping("/{id}/prescriptions")
  @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
  public ResponseEntity<PrescriptionDto> addPrescription(@PathVariable("id") Long patientId,
                              @Valid @RequestBody CreatePrescriptionRequest request) {
    PrescriptionDto dto = patientService.addPrescription(patientId, request);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // List Medical Reports (patient/admin/doctor)
  @GetMapping("/{id}/reports")
  @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId == principal.id)")
  public ResponseEntity<List<MedicalReportDto>> getMedicalReports(@PathVariable("id") Long patientId) {
    List<MedicalReportDto> list = patientService.getMedicalReports(patientId);
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  // Upload Medical Report (patient only)
  @PostMapping(value = "/{id}/reports", consumes = "multipart/form-data")
  @PreAuthorize("hasRole('PATIENT') and #patientId == principal.id")
  public ResponseEntity<MedicalReportDto> uploadMedicalReport(@PathVariable("id") Long patientId,
                                @RequestPart("file") org.springframework.web.multipart.MultipartFile file,
                                @RequestPart(value = "description", required = false) String description) {
    MedicalReportDto dto = patientService.uploadMedicalReport(patientId, file, description);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // Delete Medical Report (patient or admin)
  @DeleteMapping("/{id}/reports/{reportId}")
  @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and #patientId == principal.id)")
  public ResponseEntity<Void> deleteMedicalReport(@PathVariable("id") Long patientId,
                          @PathVariable("reportId") Long reportId) {
    patientService.deleteMedicalReport(patientId, reportId);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
