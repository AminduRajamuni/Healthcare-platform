package com.healthcare.appointmentservice.service.impl;

import com.healthcare.appointmentservice.entity.Appointment;
import com.healthcare.appointmentservice.exception.DoctorNotAvailableException;
import com.healthcare.appointmentservice.exception.ResourceNotFoundException;
import com.healthcare.appointmentservice.repository.AppointmentRepository;
import com.healthcare.appointmentservice.service.AppointmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final RestTemplate restTemplate;

    @Override
    public Appointment bookAppointment(Appointment appointment) {
        // 1. Validate Patient via API call
        try {
            restTemplate.getForEntity("http://localhost:8080/api/patients/" + appointment.getPatientId(), Object.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Patient not found with ID: " + appointment.getPatientId());
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with Patient Service: " + e.getMessage());
        }

        // 2. Validate Doctor via API call
        try {
            ResponseEntity<Map> doctorResponse = restTemplate.getForEntity(
                    "http://localhost:8081/api/doctors/" + appointment.getDoctorId(), Map.class);
            
            // Check availability - assuming doctor service returns an Object map matching Doctor entity
            Map<String, Object> doctorBody = doctorResponse.getBody();
            if (doctorBody != null) {
                Boolean isAvailable = (Boolean) doctorBody.get("isAvailable");
                if (isAvailable != null && !isAvailable) {
                    throw new DoctorNotAvailableException("Doctor is currently not available for new appointments.");
                }
            }
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Doctor not found with ID: " + appointment.getDoctorId());
        } catch (DoctorNotAvailableException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with Doctor Service: " + e.getMessage());
        }

        // 3. Save Appointment
        appointment.setStatus("BOOKED");
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Appointment not found with ID: " + id)
        );
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Appointment not found with ID: " + id)
        );
        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Appointment not found with ID: " + id)
        );
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}
