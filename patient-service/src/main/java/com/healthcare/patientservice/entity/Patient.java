package com.healthcare.patientservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "patients")
public class Patient {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "First name is required")
  @Column(name = "first_name", nullable = false, length = 50)
  private String firstName;

  @NotBlank(message = "Last name is required")
  @Column(name = "last_name", nullable = false, length = 50)
  private String lastName;

  @NotBlank(message = "Email is required")
  @Email(message = "Email should be valid")
  @Column(nullable = false, unique = true, length = 100)
  private String email;

  @NotBlank(message = "Phone number is required")
  @Column(nullable = false, length = 15)
  private String phone;

  @NotBlank(message = "Password is required")
  @Column(nullable = false, length = 255)
  private String password;

  @Past(message = "Date of birth must be in the past")
  @Column(name = "dob")
  private LocalDate dob;

  @Column(name = "gender", length = 10)
  private String gender;

  @CreationTimestamp
  @Column(name = "created_at", nullable = true, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = true, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
  private LocalDateTime updatedAt;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private Role role = Role.PATIENT;

  @Column(name = "is_deleted", nullable = false)
  private boolean deleted = false;
}
