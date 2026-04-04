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
public class MedicalHistoryDto {
	private Long id;
	private Long patientId;
	private String condition;
	private String notes;
	private LocalDate date;
}

