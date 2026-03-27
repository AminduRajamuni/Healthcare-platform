package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.entity.Appointment;
import java.util.List;

public interface AppointmentService {
    Appointment bookAppointment(Appointment appointment);
    Appointment getAppointmentById(Long id);
    List<Appointment> getAllAppointments();
    Appointment cancelAppointment(Long id);
    Appointment updateStatus(Long id, String status);
}
