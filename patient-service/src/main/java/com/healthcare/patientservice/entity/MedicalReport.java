package com.healthcare.patientservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "medical_reports")
public class MedicalReport {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "file_name", nullable = false, length = 255)
	private String fileName;

	@Column(name = "content_type", nullable = false, length = 100)
	private String contentType;

	@Column(length = 500)
	private String description;

	@Lob
	@Column(name = "data", nullable = false, columnDefinition = "LONGBLOB")
	private byte[] data;

	@Column(name = "uploaded_at", nullable = false)
	private LocalDateTime uploadedAt;
}

