package com.healthcare.telemedicineservice.dto;

import com.healthcare.telemedicineservice.entity.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemedicineSessionDto {
  private Long id;
  private Long appointmentId;
  private Long doctorId;
  private Long patientId;
  private LocalDateTime scheduledTime;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String videoLink;
  private SessionStatus status;
  private String notes;
}
