package com.healthcare.notificationservice.service;

import com.healthcare.notificationservice.event.AppointmentCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationConsumer {

    @KafkaListener(topics = "appointment-created", groupId = "notification-group")
    public void consume(AppointmentCreatedEvent event) {
        log.info("===============================================");
        log.info("Notification sent for Appointment ID: {}", event.getAppointmentId());
        log.info("Patient ID: {}", event.getPatientId());
        log.info("Doctor ID: {}", event.getDoctorId());
        log.info("Appointment Date: {}", event.getAppointmentDate());
        log.info("===============================================");
    }
}
