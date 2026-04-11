package com.healthcare.doctorservice.service;

import java.util.List;
import java.util.Map;

public interface DoctorReportService {

    List<Map<String, Object>> getPatientReports(Long doctorId, Long patientId);
}
