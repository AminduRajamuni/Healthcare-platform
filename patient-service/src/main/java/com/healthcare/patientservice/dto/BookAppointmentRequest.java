package com.healthcare.patientservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookAppointmentRequest {

    @NotNull(message = "Doctor id is required")
    private Long doctorId;

    @NotNull(message = "Appointment date/time is required")
    @Future(message = "Appointment time must be in the future")
    private LocalDateTime appointmentDateTime;

    private String reason;

    /**
     * This field will be populated in the service layer based on the authenticated patient,
     * not from the client request body.
     */
    private Long patientId;
}

