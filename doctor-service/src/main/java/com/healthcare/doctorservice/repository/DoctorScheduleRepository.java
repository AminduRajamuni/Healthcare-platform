package com.healthcare.doctorservice.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.doctorservice.entity.DoctorSchedule;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    List<DoctorSchedule> findByDoctorIdOrderByScheduleDateAscStartTimeAsc(Long doctorId);

    Optional<DoctorSchedule> findByIdAndDoctorId(Long id, Long doctorId);

    List<DoctorSchedule> findByDoctorIdAndScheduleDateAndIsBookedFalseOrderByStartTimeAsc(Long doctorId,
            LocalDate scheduleDate);
}