package com.healthcare.appointmentservice.controller;

import com.healthcare.appointmentservice.entity.Appointment;
import com.healthcare.appointmentservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@AllArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Build Book Appointment REST API
    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(@Valid @RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.bookAppointment(appointment);
        return new ResponseEntity<>(savedAppointment, HttpStatus.CREATED);
    }

    // Build Get Appointment By ID REST API
    @GetMapping("{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable("id") Long appointmentId) {
        Appointment appointment = appointmentService.getAppointmentById(appointmentId);
        return new ResponseEntity<>(appointment, HttpStatus.OK);
    }

    // Build Get All Appointments REST API
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    // Build Update Appointment Status REST API
    @PutMapping("{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable("id") Long appointmentId,
                                                               @RequestParam("status") String status) {
        Appointment updatedAppointment = appointmentService.updateStatus(appointmentId, status);
        return new ResponseEntity<>(updatedAppointment, HttpStatus.OK);
    }

    // Build Cancel/Delete Appointment REST API
    @DeleteMapping("{id}")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable("id") Long appointmentId) {
        Appointment cancelledAppointment = appointmentService.cancelAppointment(appointmentId);
        return new ResponseEntity<>(cancelledAppointment, HttpStatus.OK);
    }
}
