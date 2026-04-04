package com.healthcare.patientservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "medical_history")
public class MedicalHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "condition_name", nullable = false, length = 100)
	private String condition;

	@Column(length = 500)
	private String notes;

	@Column(name = "record_date", nullable = false)
	private LocalDate date;
}


