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
public class DoctorPatientSummaryDto {
    private Long patientId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDateTime lastAppointmentDate;
}