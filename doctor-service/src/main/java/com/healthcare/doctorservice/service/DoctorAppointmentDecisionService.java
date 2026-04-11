package com.healthcare.doctorservice.service;

import java.util.Map;

public interface DoctorAppointmentDecisionService {

    Map<String, Object> decideAppointment(Long doctorId, Long appointmentId, String decision);
}