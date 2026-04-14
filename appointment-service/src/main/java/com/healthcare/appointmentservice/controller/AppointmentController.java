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
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> bookAppointment(@Valid @RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.bookAppointment(appointment);
        return new ResponseEntity<>(savedAppointment, HttpStatus.CREATED);
    }

    // Build Get Appointment By ID REST API
    @GetMapping("{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable("id") Long appointmentId) {
        Appointment appointment = appointmentService.getAppointmentById(appointmentId);
        return new ResponseEntity<>(appointment, HttpStatus.OK);
    }

    // Build Get Appointments By Patient ID REST API
    @GetMapping("patient/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatientId(@PathVariable("id") Long patientId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    // Build Get Appointments By Doctor ID REST API
    @GetMapping("doctor/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctorId(@PathVariable("id") Long doctorId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    // Build Get All Appointments REST API
    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    // Build Update Appointment Status REST API
    @PutMapping("{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('DOCTOR') or hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable("id") Long appointmentId,
                                                               @RequestParam("status") String status) {
        Appointment updatedAppointment = appointmentService.updateStatus(appointmentId, status);
        return new ResponseEntity<>(updatedAppointment, HttpStatus.OK);
    }

    // Build Cancel/Delete Appointment REST API
    @DeleteMapping("{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable("id") Long appointmentId) {
        Appointment cancelledAppointment = appointmentService.cancelAppointment(appointmentId);
        return new ResponseEntity<>(cancelledAppointment, HttpStatus.OK);
    }

    // Build Hard Delete Appointment REST API
    @DeleteMapping("{id}/hard")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> hardDeleteAppointment(@PathVariable("id") Long appointmentId) {
        appointmentService.deleteAppointment(appointmentId);
        return new ResponseEntity<>("Appointment permanently deleted", HttpStatus.OK);
    }
}
