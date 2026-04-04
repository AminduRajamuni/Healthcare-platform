package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileDto {
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String phone;
	private LocalDate dob;
	private String gender;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}


