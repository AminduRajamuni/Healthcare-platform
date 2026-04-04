package com.healthcare.patientservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreatePrescriptionRequest {

	@NotBlank(message = "Doctor name is required")
	private String doctorName;

	@NotBlank(message = "Medicine is required")
	private String medicine;

	@NotBlank(message = "Dosage is required")
	private String dosage;

	@NotNull(message = "Date is required")
	private LocalDate date;
}

