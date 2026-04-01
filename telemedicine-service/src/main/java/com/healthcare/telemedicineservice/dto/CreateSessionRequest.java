package com.healthcare.telemedicineservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionRequest {
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
}
