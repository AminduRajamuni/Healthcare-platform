package com.healthcare.telemedicineservice.repository;

import com.healthcare.telemedicineservice.entity.TelemedicineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelemedicineSessionRepository extends JpaRepository<TelemedicineSession, Long> {
  Optional<TelemedicineSession> findByAppointmentId(Long appointmentId);
  boolean existsByAppointmentId(Long appointmentId);

  List<TelemedicineSession> findByPatientId(Long patientId);
  List<TelemedicineSession> findByDoctorId(Long doctorId);
}
