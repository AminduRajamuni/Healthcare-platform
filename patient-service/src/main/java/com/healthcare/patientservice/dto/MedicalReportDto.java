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
public class MedicalReportDto {
	private Long id;
	private Long patientId;
	private String fileName;
	private String contentType;
	private String description;
	private LocalDateTime uploadedAt;
}

