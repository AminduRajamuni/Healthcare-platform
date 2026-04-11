package com.healthcare.doctorservice.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.doctorservice.entity.DoctorSchedule;
import com.healthcare.doctorservice.service.DoctorScheduleService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/doctors/{doctorId}/schedules")
@AllArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    @PostMapping
    public ResponseEntity<DoctorSchedule> createSchedule(@PathVariable("doctorId") Long doctorId,
            @Valid @RequestBody DoctorSchedule schedule) {
        DoctorSchedule savedSchedule = doctorScheduleService.createSchedule(doctorId, schedule);
        return new ResponseEntity<>(savedSchedule, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DoctorSchedule>> getSchedules(@PathVariable("doctorId") Long doctorId) {
        List<DoctorSchedule> schedules = doctorScheduleService.getSchedules(doctorId);
        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @PutMapping("{scheduleId}")
    public ResponseEntity<DoctorSchedule> updateSchedule(@PathVariable("doctorId") Long doctorId,
            @PathVariable("scheduleId") Long scheduleId,
            @Valid @RequestBody DoctorSchedule schedule) {
        DoctorSchedule updatedSchedule = doctorScheduleService.updateSchedule(doctorId, scheduleId, schedule);
        return new ResponseEntity<>(updatedSchedule, HttpStatus.OK);
    }

    @DeleteMapping("{scheduleId}")
    public ResponseEntity<String> deleteSchedule(@PathVariable("doctorId") Long doctorId,
            @PathVariable("scheduleId") Long scheduleId) {
        doctorScheduleService.deleteSchedule(doctorId, scheduleId);
        return new ResponseEntity<>("Doctor schedule entry successfully deleted!", HttpStatus.OK);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<DoctorSchedule>> getAvailableSlots(@PathVariable("doctorId") Long doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DoctorSchedule> availableSlots = doctorScheduleService.getAvailableSlots(doctorId, date);
        return new ResponseEntity<>(availableSlots, HttpStatus.OK);
    }
}