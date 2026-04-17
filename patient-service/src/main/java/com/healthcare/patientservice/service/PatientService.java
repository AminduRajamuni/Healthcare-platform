package com.healthcare.patientservice.service;

import com.healthcare.patientservice.dto.*;

import java.util.List;

public interface PatientService {
  PatientProfileDto registerPatient(RegisterPatientRequest request);

  PatientProfileDto getPatientById(Long id);

  List<PatientListItemDto> getAllPatients();

  PatientProfileDto updatePatient(Long id, UpdatePatientRequest request);

  void deletePatient(Long id);

  // Medical history
  List<MedicalHistoryDto> getMedicalHistory(Long patientId);

  MedicalHistoryDto addMedicalHistory(Long patientId, CreateMedicalHistoryRequest request);

  // Prescriptions
  List<PrescriptionDto> getPrescriptions(Long patientId);

  PrescriptionDto addPrescription(Long patientId, CreatePrescriptionRequest request);

  // Medical reports
  List<MedicalReportDto> getMedicalReports(Long patientId);

  MedicalReportDto uploadMedicalReport(Long patientId, org.springframework.web.multipart.MultipartFile file,
      String description);

  void deleteMedicalReport(Long patientId, Long reportId);

  com.healthcare.patientservice.entity.MedicalReport getMedicalReportData(Long patientId, Long reportId);

  // Cross-service operations
  java.util.List<DoctorDto> searchDoctors(String specialty);

  AppointmentDto bookAppointment(Long patientId, BookAppointmentRequest request);

  java.util.List<AppointmentDto> getPatientAppointments(Long patientId);

  TelemedicineSessionDto getVideoLink(Long patientId, Long appointmentId);

  java.util.List<DoctorPatientSummaryDto> getPatientsForDoctor(Long doctorId);
}
