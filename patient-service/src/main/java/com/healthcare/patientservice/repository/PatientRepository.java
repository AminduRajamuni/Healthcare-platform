package com.healthcare.patientservice.repository;

import com.healthcare.patientservice.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
  Optional<Patient> findByEmailAndDeletedFalse(String email);
  Optional<Patient> findByIdAndDeletedFalse(Long id);
  List<Patient> findAllByDeletedFalse();
}
