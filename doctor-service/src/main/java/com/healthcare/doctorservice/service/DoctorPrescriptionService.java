package com.healthcare.doctorservice.service;

import java.util.Map;

import com.healthcare.doctorservice.dto.IssuePrescriptionRequest;

public interface DoctorPrescriptionService {

    Map<String, Object> issuePrescription(Long doctorId, Long patientId, IssuePrescriptionRequest request);
}
