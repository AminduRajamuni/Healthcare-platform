package com.healthcare.doctorservice.service;

import java.util.List;

import com.healthcare.doctorservice.entity.Doctor;

public interface DoctorService {

    Doctor addDoctor(Doctor doctor);

    Doctor getDoctorById(Long id);

    Doctor getDoctorByEmail(String email);

    List<Doctor> getAllDoctors();

    List<Doctor> searchDoctors(String specialization, Boolean isAvailable, String name);

    Doctor updateDoctor(Doctor doctor, Long id);

    Doctor updateDoctorAvailability(Long id, Boolean isAvailable);

    Doctor verifyDoctor(Long id);

    List<Doctor> getUnverifiedDoctors();

    void deleteDoctor(Long id);
}
