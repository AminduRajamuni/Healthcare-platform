package com.healthcare.symptomcheckerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomRequest {

    @NotBlank(message = "Symptoms field must not be blank")
    @Size(min = 3, max = 1000, message = "Symptoms must be between 3 and 1000 characters")
    private String symptoms;
}
