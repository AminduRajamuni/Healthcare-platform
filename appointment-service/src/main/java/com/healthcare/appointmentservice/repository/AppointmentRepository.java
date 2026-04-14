package com.healthcare.appointmentservice.repository;

import com.healthcare.appointmentservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, java.time.LocalDateTime appointmentDate, String status);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
}
