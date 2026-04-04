package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PrescriptionDto {
	private Long id;
	private Long patientId;
	private String doctorName;
	private String medicine;
	private String dosage;
	private LocalDate date;
}

