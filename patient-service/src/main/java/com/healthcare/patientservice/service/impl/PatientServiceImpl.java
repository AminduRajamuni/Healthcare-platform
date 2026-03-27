package com.healthcare.patientservice.service.impl;

import com.healthcare.patientservice.entity.Patient;
import com.healthcare.patientservice.exception.EmailAlreadyExistsException;
import com.healthcare.patientservice.exception.ResourceNotFoundException;
import com.healthcare.patientservice.repository.PatientRepository;
import com.healthcare.patientservice.service.PatientService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    public Patient registerPatient(Patient patient) {
        Optional<Patient> existingPatient = patientRepository.findByEmail(patient.getEmail());
        if (existingPatient.isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists for a user");
        }
        return patientRepository.save(patient);
    }

    @Override
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Patient", "id", id)
        );
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient updatePatient(Patient patient, Long id) {
        Patient existingPatient = patientRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Patient", "id", id)
        );

        Optional<Patient> patientWithSameEmail = patientRepository.findByEmail(patient.getEmail());
        if(patientWithSameEmail.isPresent() && !patientWithSameEmail.get().getId().equals(id)) {
            throw new EmailAlreadyExistsException("Email already exists for another user");
        }

        existingPatient.setName(patient.getName());
        existingPatient.setEmail(patient.getEmail());
        existingPatient.setPhone(patient.getPhone());
        existingPatient.setPassword(patient.getPassword());

        return patientRepository.save(existingPatient);
    }

    @Override
    public void deletePatient(Long id) {
        Patient existingPatient = patientRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Patient", "id", id)
        );
        patientRepository.delete(existingPatient);
    }

    @Override
    public String login(com.healthcare.patientservice.dto.LoginDto loginDto) {
        Patient existingPatient = patientRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "email", loginDto.getEmail()));

        // In a real application, you should hash passwords and compare the hashes!
        if(existingPatient.getPassword().equals(loginDto.getPassword())) {
            return "Login Successful";
        } else {
            throw new RuntimeException("Invalid Password");
        }
    }
}
