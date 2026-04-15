package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDto {

    private Long id;
    private String firstName;
    private String lastName;
    /**
     * Optional full name field for convenience when integrating with other services.
     */
    private String name;
    private String email;
    private String specialty;
    private String phone;
    private Boolean available;
    private BigDecimal consultationFee;
}

