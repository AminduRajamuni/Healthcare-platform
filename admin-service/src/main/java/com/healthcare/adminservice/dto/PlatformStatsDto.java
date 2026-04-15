package com.healthcare.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlatformStatsDto {
    private int totalUsers;
    private int totalDoctors;
    private int totalAppointments;
    private int totalPayments;
}
