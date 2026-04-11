package com.healthcare.doctorservice.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.healthcare.doctorservice.entity.Doctor;
import com.healthcare.doctorservice.entity.DoctorSchedule;
import com.healthcare.doctorservice.exception.ResourceNotFoundException;
import com.healthcare.doctorservice.repository.DoctorRepository;
import com.healthcare.doctorservice.repository.DoctorScheduleRepository;
import com.healthcare.doctorservice.service.DoctorScheduleService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public DoctorSchedule createSchedule(Long doctorId, DoctorSchedule schedule) {
        ensureDoctorExists(doctorId);

        schedule.setId(null);
        schedule.setDoctorId(doctorId);
        if (schedule.getIsBooked() == null) {
            schedule.setIsBooked(Boolean.FALSE);
        }

        return doctorScheduleRepository.save(schedule);
    }

    @Override
    public List<DoctorSchedule> getSchedules(Long doctorId) {
        ensureDoctorExists(doctorId);
        return doctorScheduleRepository.findByDoctorIdOrderByScheduleDateAscStartTimeAsc(doctorId);
    }

    @Override
    public DoctorSchedule updateSchedule(Long doctorId, Long scheduleId, DoctorSchedule schedule) {
        ensureDoctorExists(doctorId);

        DoctorSchedule existingSchedule = doctorScheduleRepository.findByIdAndDoctorId(scheduleId, doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", scheduleId));

        existingSchedule.setScheduleDate(schedule.getScheduleDate());
        existingSchedule.setStartTime(schedule.getStartTime());
        existingSchedule.setEndTime(schedule.getEndTime());
        if (schedule.getIsBooked() != null) {
            existingSchedule.setIsBooked(schedule.getIsBooked());
        }

        return doctorScheduleRepository.save(existingSchedule);
    }

    @Override
    public void deleteSchedule(Long doctorId, Long scheduleId) {
        ensureDoctorExists(doctorId);

        DoctorSchedule existingSchedule = doctorScheduleRepository.findByIdAndDoctorId(scheduleId, doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", scheduleId));

        doctorScheduleRepository.delete(existingSchedule);
    }

    @Override
    public List<DoctorSchedule> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = ensureDoctorExists(doctorId);
        if (Boolean.FALSE.equals(doctor.getIsAvailable())) {
            return List.of();
        }

        return doctorScheduleRepository.findByDoctorIdAndScheduleDateAndIsBookedFalseOrderByStartTimeAsc(doctorId,
                date);
    }

    private Doctor ensureDoctorExists(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
    }
}