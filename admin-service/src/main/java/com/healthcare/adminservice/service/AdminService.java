package com.healthcare.adminservice.service;

import java.util.List;

import com.healthcare.adminservice.dto.DoctorDto;

public interface AdminService {

    DoctorDto verifyDoctor(Long id);

    List<DoctorDto> getUnverifiedDoctors();

    List<Object> getAllUsers();

    List<Object> getAllPayments();

    void deleteUser(Long id);

    com.healthcare.adminservice.dto.PlatformStatsDto getPlatformStats();
}
