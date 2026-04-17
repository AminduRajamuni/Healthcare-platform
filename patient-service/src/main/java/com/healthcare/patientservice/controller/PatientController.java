package com.healthcare.patientservice.controller;

import com.healthcare.patientservice.dto.*;
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

  // Register Patient
  @PostMapping("/register")
  public ResponseEntity<PatientProfileDto> registerPatient(@Valid @RequestBody RegisterPatientRequest request) {
    PatientProfileDto savedPatient = patientService.registerPatient(request);
    return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
  }

  // Get Patient By ID (secured)
  @GetMapping("/{id}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<PatientProfileDto> getPatientById(@PathVariable("id") Long patientId) {
    PatientProfileDto patient = patientService.getPatientById(patientId);
    return new ResponseEntity<>(patient, HttpStatus.OK);
  }

  // Get patients for a doctor (doctor only)
  @GetMapping("/doctor/{doctorId}/summary")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR') and #doctorId.toString().equals(authentication.principal)")
  public ResponseEntity<List<DoctorPatientSummaryDto>> getPatientsForDoctor(@PathVariable Long doctorId) {
    List<DoctorPatientSummaryDto> patients = patientService.getPatientsForDoctor(doctorId);
    return new ResponseEntity<>(patients, HttpStatus.OK);
  }

  // Get All Patients (admin only)
  @GetMapping
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<PatientListItemDto>> getAllPatients(
      @RequestParam(value = "page", defaultValue = "0") int page,
      @RequestParam(value = "size", defaultValue = "20") int size) {

    List<PatientListItemDto> patients = patientService.getAllPatients();

    if (page < 0) {
      page = 0;
    }
    if (size <= 0) {
      size = 20;
    }

    int fromIndex = Math.min(page * size, patients.size());
    int toIndex = Math.min(fromIndex + size, patients.size());

    List<PatientListItemDto> pagedPatients = patients.subList(fromIndex, toIndex);

    return new ResponseEntity<>(pagedPatients, HttpStatus.OK);
  }

  // Update Patient (secured)
  @PutMapping("/{id}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<PatientProfileDto> updatePatient(@PathVariable("id") Long patientId,
      @Valid @RequestBody UpdatePatientRequest request) {
    PatientProfileDto updatedPatient = patientService.updatePatient(patientId, request);
    return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
  }

  // Delete Patient (secured - admin only for safety)
  @DeleteMapping("/{id}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deletePatient(@PathVariable("id") Long patientId) {
    patientService.deletePatient(patientId);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }

  // Search doctors (all authenticated roles)
  @GetMapping("/doctors/search")
  public ResponseEntity<List<DoctorDto>> searchDoctors(
      @RequestParam(value = "specialty", required = false) String specialty) {
    List<DoctorDto> doctors = patientService.searchDoctors(specialty);
    return new ResponseEntity<>(doctors, HttpStatus.OK);
  }

  // Get Medical History (patient/admin/doctor)
  @GetMapping("/{id}/medical-history")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<List<MedicalHistoryDto>> getMedicalHistory(@PathVariable("id") Long patientId) {
    List<MedicalHistoryDto> history = patientService.getMedicalHistory(patientId);
    return new ResponseEntity<>(history, HttpStatus.OK);
  }

  // Add Medical History (doctor/admin)
  @PostMapping("/{id}/medical-history")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
  public ResponseEntity<MedicalHistoryDto> addMedicalHistory(@PathVariable("id") Long patientId,
      @Valid @RequestBody CreateMedicalHistoryRequest request) {
    MedicalHistoryDto dto = patientService.addMedicalHistory(patientId, request);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // Get Prescriptions (patient/admin/doctor)
  @GetMapping("/{id}/prescriptions")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<List<PrescriptionDto>> getPrescriptions(@PathVariable("id") Long patientId) {
    List<PrescriptionDto> prescriptions = patientService.getPrescriptions(patientId);
    return new ResponseEntity<>(prescriptions, HttpStatus.OK);
  }

  // Add Prescription (doctor/admin)
  @PostMapping("/{id}/prescriptions")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
  public ResponseEntity<PrescriptionDto> addPrescription(@PathVariable("id") Long patientId,
      @Valid @RequestBody CreatePrescriptionRequest request) {
    PrescriptionDto dto = patientService.addPrescription(patientId, request);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // List Medical Reports (patient/admin/doctor)
  @GetMapping("/{id}/reports")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<List<MedicalReportDto>> getMedicalReports(@PathVariable("id") Long patientId) {
    List<MedicalReportDto> reports = patientService.getMedicalReports(patientId);
    return new ResponseEntity<>(reports, HttpStatus.OK);
  }

  // Upload Medical Report (patient only)
  @PostMapping(value = "/{id}/reports", consumes = "multipart/form-data")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') and #patientId.toString().equals(authentication.principal)")
  public ResponseEntity<MedicalReportDto> uploadMedicalReport(@PathVariable("id") Long patientId,
      @RequestPart("file") org.springframework.web.multipart.MultipartFile file,
      @RequestPart(value = "description", required = false) String description) {

    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File must not be empty");
    }

    long maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.getSize() > maxSizeBytes) {
      throw new IllegalArgumentException("File size exceeds 5MB limit");
    }

    String contentType = file.getContentType();
    if (contentType == null ||
        !(contentType.equalsIgnoreCase("application/pdf") ||
            contentType.startsWith("image/") ||
            contentType.equalsIgnoreCase("application/msword") ||
            contentType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
      throw new IllegalArgumentException("Unsupported file type");
    }

    MedicalReportDto dto = patientService.uploadMedicalReport(patientId, file, description);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // Delete Medical Report (patient or admin)
  @DeleteMapping("/{id}/reports/{reportId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<Void> deleteMedicalReport(@PathVariable("id") Long patientId,
      @PathVariable("reportId") Long reportId) {
    patientService.deleteMedicalReport(patientId, reportId);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }

  // Download Medical Report (patient/admin/doctor)
  @GetMapping("/{id}/reports/{reportId}/download")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<org.springframework.core.io.ByteArrayResource> downloadMedicalReport(
      @PathVariable("id") Long patientId,
      @PathVariable("reportId") Long reportId) {

    com.healthcare.patientservice.entity.MedicalReport report = patientService.getMedicalReportData(patientId,
        reportId);
    org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(
        report.getData());

    return org.springframework.http.ResponseEntity.ok()
        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + report.getFileName() + "\"")
        .contentType(org.springframework.http.MediaType.parseMediaType(report.getContentType()))
        .body(resource);
  }

  // Book appointment for patient (patient or admin)
  @PostMapping("/{id}/appointments")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<AppointmentDto> bookAppointment(@PathVariable("id") Long patientId,
      @Valid @RequestBody BookAppointmentRequest request) {
    AppointmentDto dto = patientService.bookAppointment(patientId, request);
    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  // Get all appointments for a patient
  @GetMapping("/{id}/appointments")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<List<AppointmentDto>> getPatientAppointments(@PathVariable("id") Long patientId) {
    List<AppointmentDto> appointments = patientService.getPatientAppointments(patientId);
    return new ResponseEntity<>(appointments, HttpStatus.OK);
  }

  // Get telemedicine video link/session info for an appointment
  @GetMapping("/{id}/appointments/{appointmentId}/video-link")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or (hasRole('PATIENT') and #patientId.toString().equals(authentication.principal))")
  public ResponseEntity<TelemedicineSessionDto> getVideoLink(@PathVariable("id") Long patientId,
      @PathVariable Long appointmentId) {
    TelemedicineSessionDto session = patientService.getVideoLink(patientId, appointmentId);
    return new ResponseEntity<>(session, HttpStatus.OK);
  }
}
