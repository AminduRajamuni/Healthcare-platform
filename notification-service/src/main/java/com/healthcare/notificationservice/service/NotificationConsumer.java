package com.healthcare.notificationservice.service;

import com.healthcare.notificationservice.event.AppointmentEvent;
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

        if ("APPOINTMENT_CREATED".equals(event.getEventType())) {
            message = "Appointment confirmed";
            subject = "Appointment Confirmation";
            body = "Your appointment is confirmed on " + event.getAppointmentDate();
        } else if ("APPOINTMENT_CANCELLED".equals(event.getEventType())) {
            message = "Appointment has been cancelled";
            subject = "Appointment Cancelled";
            body = "Your appointment has been cancelled";
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

        // Fixed test email - in a production environment, this would fetch from Patient
        // Service
        String testEmail = "amindurajamuni@gmail.com";

        try {
            emailService.sendEmail(testEmail, subject, body);
            log.info("Email sent successfully to {}", testEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}", testEmail, e);
        }
    }
}
