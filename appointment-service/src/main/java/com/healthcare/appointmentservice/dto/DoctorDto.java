package com.healthcare.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDto {
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private String phone;
    private String availability;
    private Boolean isAvailable;
}
