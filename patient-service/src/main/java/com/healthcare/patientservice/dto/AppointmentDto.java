package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private LocalDateTime appointmentDateTime;
    private String status;
    private BigDecimal fee;
    private String paymentStatus;
}

