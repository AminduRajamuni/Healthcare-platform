package com.healthcare.appointmentservice.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentEvent {
    private String eventType;
    private UUID eventId;
    private String timestamp;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String appointmentDate;
}
