package com.healthcare.doctorservice.service;

import java.util.List;
import java.util.Map;

public interface DoctorTelemedicineBridgeService {

    List<Map<String, Object>> getDoctorSessions(Long doctorId);

    Map<String, Object> joinSession(Long doctorId, Long sessionId);

    Map<String, Object> endSession(Long doctorId, Long sessionId);
}
