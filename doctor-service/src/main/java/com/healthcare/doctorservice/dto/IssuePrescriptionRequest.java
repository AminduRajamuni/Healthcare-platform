package com.healthcare.doctorservice.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IssuePrescriptionRequest {

    @NotBlank(message = "Medicine is required")
    private String medicine;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
