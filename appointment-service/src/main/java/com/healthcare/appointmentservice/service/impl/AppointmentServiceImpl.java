package com.healthcare.appointmentservice.service.impl;

import com.healthcare.appointmentservice.dto.DoctorDto;
import com.healthcare.appointmentservice.dto.PatientDto;
import com.healthcare.appointmentservice.entity.Appointment;
import com.healthcare.appointmentservice.exception.DoctorNotAvailableException;
import com.healthcare.appointmentservice.exception.ResourceNotFoundException;
import com.healthcare.appointmentservice.repository.AppointmentRepository;
import com.healthcare.appointmentservice.service.AppointmentService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import com.healthcare.appointmentservice.event.AppointmentEvent;
import java.time.LocalDateTime;
import java.util.UUID;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final RestTemplate restTemplate;
    private final KafkaTemplate<String, AppointmentEvent> kafkaTemplate;

    @Override
    public Appointment bookAppointment(Appointment appointment) {
        log.info("Initiating booking for Patient ID: {} with Doctor ID: {}", appointment.getPatientId(), appointment.getDoctorId());

        // 1. Validate Patient via API call
        try {
            log.info("Calling patient-service to verify Patient ID: {}", appointment.getPatientId());
            ResponseEntity<PatientDto> patientResponse = restTemplate.getForEntity("http://localhost:8080/api/patients/" + appointment.getPatientId(), PatientDto.class);
            log.info("Patient verified successfully: {}", patientResponse.getBody().getName());
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Patient validation failed: HTTP 404 Not Found");
            throw new ResourceNotFoundException("Patient not found with ID: " + appointment.getPatientId());
        } catch (Exception e) {
            log.error("Error communicating with patient-service: {}", e.getMessage());
            throw new RuntimeException("Error communicating with Patient Service: " + e.getMessage());
        }

        // 2. Validate Doctor via API call
        try {
            log.info("Calling doctor-service to verify Doctor ID: {}", appointment.getDoctorId());
            ResponseEntity<DoctorDto> doctorResponse = restTemplate.getForEntity(
                    "http://localhost:8081/api/doctors/" + appointment.getDoctorId(), DoctorDto.class);
            
            DoctorDto doctorDto = doctorResponse.getBody();
            if (doctorDto != null) {
                log.info("Doctor verified successfully: {}. Checking availability...", doctorDto.getName());
                if (doctorDto.getIsAvailable() != null && !doctorDto.getIsAvailable()) {
                    log.error("Doctor {} is not available for booking.", doctorDto.getName());
                    throw new DoctorNotAvailableException("Doctor is currently not available for new appointments.");
                }
            }
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Doctor validation failed: HTTP 404 Not Found");
            throw new ResourceNotFoundException("Doctor not found with ID: " + appointment.getDoctorId());
        } catch (DoctorNotAvailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with doctor-service: {}", e.getMessage());
            throw new RuntimeException("Error communicating with Doctor Service: " + e.getMessage());
        }

        // 3. Validate Time Slot Conflict
        log.info("Checking for double booking on date: {} (ignoring cancelled)", appointment.getAppointmentDate());
        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndStatusNot(appointment.getDoctorId(), appointment.getAppointmentDate(), "CANCELLED")) {
            log.error("Double booking detected for Doctor ID {} at {}", appointment.getDoctorId(), appointment.getAppointmentDate());
            throw new com.healthcare.appointmentservice.exception.TimeSlotAlreadyBookedException("Doctor already has an appointment at this exact time.");
        }

        // 4. Save Appointment
        appointment.setStatus("BOOKED");
        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Appointment booked successfully with ID: {}", savedAppointment.getId());

        // 5. Publish Kafka Event (non-blocking - booking succeeds even if Kafka is temporarily unavailable)
        try {
            AppointmentEvent event = new AppointmentEvent(
                    "APPOINTMENT_CREATED",
                    UUID.randomUUID(),
                    LocalDateTime.now().toString(),
                    savedAppointment.getId(),
                    savedAppointment.getPatientId(),
                    savedAppointment.getDoctorId(),
                    savedAppointment.getAppointmentDate().toString()
            );
            kafkaTemplate.send("appointment.events", event);
            log.info("Published appointment-created event for Appointment ID: {}", savedAppointment.getId());
        } catch (Exception e) {
            // Log the FULL stack trace (not just message) to expose the real root cause
            log.error("Failed to publish Kafka event for Appointment ID: {}.", savedAppointment.getId(), e);
            // We intentionally do NOT re-throw here — the appointment is already saved.
            // Notification failure should not roll back a confirmed booking.
        }

        return savedAppointment;
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
        Appointment cancelledAppointment = appointmentRepository.save(appointment);

        // Publish Kafka Event for cancellation
        try {
            AppointmentEvent event = new AppointmentEvent(
                    "APPOINTMENT_CANCELLED",
                    UUID.randomUUID(),
                    LocalDateTime.now().toString(),
                    cancelledAppointment.getId(),
                    cancelledAppointment.getPatientId(),
                    cancelledAppointment.getDoctorId(),
                    cancelledAppointment.getAppointmentDate().toString()
            );
            kafkaTemplate.send("appointment.events", event);
            log.info("Published appointment-cancelled event for Appointment ID: {}", cancelledAppointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish Kafka event for cancelled Appointment ID: {}.", cancelledAppointment.getId(), e);
        }

        return cancelledAppointment;
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
