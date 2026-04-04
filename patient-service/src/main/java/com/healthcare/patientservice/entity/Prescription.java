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
@Table(name = "prescriptions")
public class Prescription {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "doctor_name", nullable = false, length = 100)
	private String doctorName;

	@Column(nullable = false, length = 100)
	private String medicine;

	@Column(nullable = false, length = 100)
	private String dosage;

	@Column(nullable = false)
	private LocalDate date;
}

