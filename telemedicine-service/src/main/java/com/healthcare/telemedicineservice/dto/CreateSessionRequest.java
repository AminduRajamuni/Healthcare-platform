package com.healthcare.telemedicineservice.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionRequest {
  @NotNull
  private Long appointmentId;

  @NotNull
  private Long doctorId;

  @NotNull
  private Long patientId;

  /**
   * Optional scheduled time for the session (if not provided, it can be set from the appointment).
   */
  @FutureOrPresent
  private LocalDateTime scheduledTime;
}
