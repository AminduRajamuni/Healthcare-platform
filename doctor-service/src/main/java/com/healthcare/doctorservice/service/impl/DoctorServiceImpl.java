package com.healthcare.doctorservice.service.impl;

import com.healthcare.doctorservice.entity.Doctor;
import com.healthcare.doctorservice.exception.EmailAlreadyExistsException;
import com.healthcare.doctorservice.exception.ResourceNotFoundException;
import com.healthcare.doctorservice.repository.DoctorRepository;
import com.healthcare.doctorservice.service.DoctorService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Override
    public Doctor addDoctor(Doctor doctor) {
        Optional<Doctor> existingDoctor = doctorRepository.findByEmail(doctor.getEmail());
        if (existingDoctor.isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists for another doctor");
        }
        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Doctor", "id", id)
        );
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor updateDoctor(Doctor doctor, Long id) {
        Doctor existingDoctor = doctorRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Doctor", "id", id)
        );

        Optional<Doctor> doctorWithSameEmail = doctorRepository.findByEmail(doctor.getEmail());
        if(doctorWithSameEmail.isPresent() && !doctorWithSameEmail.get().getId().equals(id)) {
            throw new EmailAlreadyExistsException("Email already exists for another doctor");
        }

        existingDoctor.setName(doctor.getName());
        existingDoctor.setSpecialization(doctor.getSpecialization());
        existingDoctor.setEmail(doctor.getEmail());
        existingDoctor.setPhone(doctor.getPhone());
        existingDoctor.setAvailability(doctor.getAvailability());
        // We preserve isAvailable state when performing a full PUT update
        // (unless we also strictly want them to update isAvailable in the PUT too, but we are doing it via PATCH)

        return doctorRepository.save(existingDoctor);
    }

    @Override
    public Doctor updateDoctorAvailability(Long id, Boolean isAvailable) {
        Doctor existingDoctor = doctorRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Doctor", "id", id)
        );
        
        existingDoctor.setIsAvailable(isAvailable);
        return doctorRepository.save(existingDoctor);
    }

    @Override
    public void deleteDoctor(Long id) {
        Doctor existingDoctor = doctorRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Doctor", "id", id)
        );
        doctorRepository.delete(existingDoctor);
    }
}
