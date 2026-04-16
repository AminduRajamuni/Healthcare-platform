package com.healthcare.adminservice.service.impl;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.healthcare.adminservice.dto.DoctorDto;
import com.healthcare.adminservice.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final RestTemplate restTemplate;

    // Hardcoded URLs based on requirements. In a real scenario, use FeignClient or load balancer.
    private final String doctorServiceUrl = "http://doctor-service:8081/api/doctors";
    private final String patientServiceUrl = "http://patient-service:8080/api/patients";
    private final String paymentServiceUrl = "http://payment-service:8086/api/payments";
    private final String appointmentServiceUrl = "http://appointment-service:8082/api/appointments";

    @Override
    public DoctorDto verifyDoctor(Long id) {
        String url = doctorServiceUrl + "/" + id + "/verify";
        ResponseEntity<DoctorDto> response = restTemplate.exchange(url, HttpMethod.PUT, null, DoctorDto.class);
        return response.getBody();
    }

    @Override
    public List<DoctorDto> getUnverifiedDoctors() {
        String url = doctorServiceUrl + "/unverified";
        DoctorDto[] unverifiedDoctors = restTemplate.getForObject(url, DoctorDto[].class);
        return unverifiedDoctors != null ? Arrays.asList(unverifiedDoctors) : Collections.emptyList();
    }

    @Override
    public List<Object> getAllUsers() {
        String url = patientServiceUrl;
        Object[] users = restTemplate.getForObject(url, Object[].class);
        return users != null ? Arrays.asList(users) : Collections.emptyList();
    }

    @Override
    public List<Object> getAllPayments() {
        String url = paymentServiceUrl;
        Object[] payments = restTemplate.getForObject(url, Object[].class);
        return payments != null ? Arrays.asList(payments) : Collections.emptyList();
    }

    @Override
    public void deleteUser(Long id) {
        String url = patientServiceUrl + "/" + id;
        restTemplate.delete(url);
    }

    @Override
    public com.healthcare.adminservice.dto.PlatformStatsDto getPlatformStats() {
        int totalUsers = 0;
        int totalDoctors = 0;
        int totalAppointments = 0;
        int totalPayments = 0;

        try {
            Object[] users = restTemplate.getForObject(patientServiceUrl, Object[].class);
            totalUsers = users != null ? users.length : 0;
        } catch (Exception e) {}

        try {
            Object[] doctors = restTemplate.getForObject(doctorServiceUrl, Object[].class);
            totalDoctors = doctors != null ? doctors.length : 0;
        } catch (Exception e) {}

        try {
            Object[] appointments = restTemplate.getForObject(appointmentServiceUrl, Object[].class);
            totalAppointments = appointments != null ? appointments.length : 0;
        } catch (Exception e) {}

        try {
            Object[] payments = restTemplate.getForObject(paymentServiceUrl, Object[].class);
            totalPayments = payments != null ? payments.length : 0;
        } catch (Exception e) {}

        return com.healthcare.adminservice.dto.PlatformStatsDto.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalAppointments(totalAppointments)
                .totalPayments(totalPayments)
                .build();
    }
}
