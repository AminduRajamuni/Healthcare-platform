package com.healthcare.patientservice.repository;

import com.healthcare.patientservice.entity.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
	List<MedicalReport> findByPatientId(Long patientId);
	Optional<MedicalReport> findByIdAndPatientId(Long id, Long patientId);
}

