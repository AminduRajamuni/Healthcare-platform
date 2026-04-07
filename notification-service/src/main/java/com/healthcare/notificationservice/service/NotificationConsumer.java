package com.healthcare.notificationservice.service;

import com.healthcare.notificationservice.client.DoctorClient;
import com.healthcare.notificationservice.client.PatientClient;
import com.healthcare.notificationservice.event.AppointmentEvent;
import com.healthcare.notificationservice.util.EmailTemplateBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailService emailService;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;
    private final EmailTemplateBuilder templateBuilder;
    private final Set<UUID> processedEvents = ConcurrentHashMap.newKeySet();

    @KafkaListener(topics = "appointment.events", groupId = "notification-group")
    public void consume(AppointmentEvent event) {
        if (event.getEventId() != null && !processedEvents.add(event.getEventId())) {
            log.debug("Duplicate event ignored: {}", event.getEventId());
            return;
        }

        String message = "";
        String subject = "";
        String body = "";
        
        // Dynamically fetch doctor name
        String doctorName = doctorClient.getDoctorName(event.getDoctorId());

        if ("APPOINTMENT_CREATED".equals(event.getEventType())) {
            message = "Appointment confirmed";
            subject = "Appointment Confirmation - Healthcare Platform";
            try {
                body = templateBuilder.buildAppointmentCreatedEmail(event, doctorName);
            } catch (Exception e) {
                log.error("Failed to build HTML HTML template. Falling back.", e);
                body = "Your appointment with " + doctorName + " (ID: " + event.getAppointmentId() + ") is confirmed on " + event.getAppointmentDate();
            }
        } else if ("APPOINTMENT_CANCELLED".equals(event.getEventType())) {
            message = "Appointment has been cancelled";
            subject = "Appointment Cancelled - Healthcare Platform";
            try {
                body = templateBuilder.buildAppointmentCancelledEmail(event, doctorName);
            } catch (Exception e) {
                log.error("Failed to build HTML HTML template. Falling back.", e);
                body = "Your appointment with " + doctorName + " (ID: " + event.getAppointmentId() + ") has been cancelled.";
            }
        } else {
            message = "Unknown event type";
            log.warn("Received unknown event type: {}", event.getEventType());
            return;
        }

        log.info("========================================");
        log.info("EVENT: {}", event.getEventType());
        log.info("Appointment ID: {}", event.getAppointmentId());
        log.info("Patient ID: {}", event.getPatientId());
        log.info("Doctor ID: {}", event.getDoctorId());
        log.info("Date: {}", event.getAppointmentDate());
        log.info("Message: {}", message);
        log.info("========================================");

        // Dynamically fetch patient email from patient-service API
        String targetEmail = patientClient.getPatientEmail(event.getPatientId());

        try {
            emailService.sendEmail(targetEmail, subject, body);
            log.info("Email sent successfully to {}", targetEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}", targetEmail, e);
        }
    }
}
