package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.entity.Doctor;
import java.util.List;

public interface DoctorService {
    Doctor addDoctor(Doctor doctor);
    Doctor getDoctorById(Long id);
    List<Doctor> getAllDoctors();
    Doctor updateDoctor(Doctor doctor, Long id);
    void deleteDoctor(Long id);
}
