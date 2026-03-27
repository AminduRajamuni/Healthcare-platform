package com.healthcare.patientservice.service;

import com.healthcare.patientservice.entity.Patient;

import java.util.List;

public interface PatientService {
    Patient registerPatient(Patient patient);
    Patient getPatientById(Long id);
    List<Patient> getAllPatients();
    Patient updatePatient(Patient patient, Long id);
    void deletePatient(Long id);
    String login(com.healthcare.patientservice.dto.LoginDto loginDto);
}
