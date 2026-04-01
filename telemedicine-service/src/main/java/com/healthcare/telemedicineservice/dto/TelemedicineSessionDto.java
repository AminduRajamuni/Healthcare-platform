package com.healthcare.telemedicineservice.dto;

import com.healthcare.telemedicineservice.entity.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemedicineSessionDto {
    private Long id;
    private String meetingLink;
    private SessionStatus status;
}
