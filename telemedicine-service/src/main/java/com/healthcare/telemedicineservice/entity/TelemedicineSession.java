package com.healthcare.telemedicineservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "telemedicine_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemedicineSession {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * ID of the confirmed appointment for which this session is created.
   */
  @Column(nullable = false, unique = true)
  private Long appointmentId;

  @Column(nullable = false)
  private Long doctorId;

  @Column(nullable = false)
  private Long patientId;

  /**
   * Scheduled start time for the telemedicine session (usually same as appointment time).
   */
  @Column(name = "scheduled_time")
  private LocalDateTime scheduledTime;

  /**
   * Actual time when the first participant joined.
   */
  @Column(name = "start_time")
  private LocalDateTime startTime;

  /**
   * Time when the session was explicitly ended.
   */
  @Column(name = "end_time")
  private LocalDateTime endTime;

  /**
   * Jitsi Meet video link for this telemedicine session.
   */
  @Column(name = "video_link", nullable = false)
  private String videoLink;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SessionStatus status;

  /**
   * Optional notes related to the session (e.g., doctor summary).
   */
  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
