package com.healthcare.telemedicineservice.service;

import com.healthcare.telemedicineservice.dto.AddSessionNotesRequest;
import com.healthcare.telemedicineservice.dto.CreateSessionRequest;
import com.healthcare.telemedicineservice.dto.TelemedicineSessionDto;

import java.util.List;

public interface TelemedicineSessionService {

  TelemedicineSessionDto createSession(CreateSessionRequest request);

  TelemedicineSessionDto getSessionById(Long id);

  TelemedicineSessionDto getSessionByAppointmentId(Long appointmentId);

  List<TelemedicineSessionDto> getSessionsForPatient(Long patientId);

  List<TelemedicineSessionDto> getSessionsForDoctor(Long doctorId);

  TelemedicineSessionDto joinSession(Long sessionId);

  TelemedicineSessionDto endSession(Long sessionId);

  TelemedicineSessionDto addSessionNotes(Long sessionId, AddSessionNotesRequest request);
}


