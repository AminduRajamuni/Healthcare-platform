package com.healthcare.telemedicineservice.service;

import com.healthcare.telemedicineservice.dto.CreateSessionRequest;
import com.healthcare.telemedicineservice.dto.TelemedicineSessionDto;
import com.healthcare.telemedicineservice.entity.TelemedicineSession;

public interface TelemedicineSessionService {
    TelemedicineSessionDto createSession(CreateSessionRequest request);
    TelemedicineSession getSessionById(Long id);
    TelemedicineSession getSessionByAppointmentId(Long appointmentId);
    TelemedicineSession updateSessionStatus(Long id, String status);
}
