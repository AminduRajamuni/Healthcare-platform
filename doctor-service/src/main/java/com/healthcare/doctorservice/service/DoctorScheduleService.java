package com.healthcare.doctorservice.service;

import java.time.LocalDate;
import java.util.List;

import com.healthcare.doctorservice.entity.DoctorSchedule;

public interface DoctorScheduleService {

    DoctorSchedule createSchedule(Long doctorId, DoctorSchedule schedule);

    List<DoctorSchedule> getSchedules(Long doctorId);

    DoctorSchedule updateSchedule(Long doctorId, Long scheduleId, DoctorSchedule schedule);

    void deleteSchedule(Long doctorId, Long scheduleId);

    List<DoctorSchedule> getAvailableSlots(Long doctorId, LocalDate date);
}