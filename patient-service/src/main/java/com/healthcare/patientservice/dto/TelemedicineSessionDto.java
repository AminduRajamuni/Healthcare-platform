package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TelemedicineSessionDto {

    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime scheduledTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String videoLink;
    private String notes;
}

