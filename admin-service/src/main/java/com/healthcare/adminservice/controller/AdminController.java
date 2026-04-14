package com.healthcare.adminservice.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.adminservice.dto.DoctorDto;
import com.healthcare.adminservice.service.AdminService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PutMapping("/doctors/{id}/verify")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorDto> verifyDoctor(@PathVariable("id") Long doctorId) {
        DoctorDto verifiedDoctor = adminService.verifyDoctor(doctorId);
        return new ResponseEntity<>(verifiedDoctor, HttpStatus.OK);
    }

    @GetMapping("/doctors/unverified")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorDto>> getUnverifiedDoctors() {
        List<DoctorDto> unverifiedDoctors = adminService.getUnverifiedDoctors();
        return new ResponseEntity<>(unverifiedDoctors, HttpStatus.OK);
    }

    @GetMapping("/users")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object>> getAllUsers() {
        List<Object> users = adminService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/payments")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object>> getAllPayments() {
        List<Object> payments = adminService.getAllPayments();
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, String>> deleteUser(@PathVariable("id") Long userId) {
        adminService.deleteUser(userId);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "User with ID " + userId + " successfully deleted from the platform.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/system/stats")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.healthcare.adminservice.dto.PlatformStatsDto> getPlatformStats() {
        com.healthcare.adminservice.dto.PlatformStatsDto stats = adminService.getPlatformStats();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }
}
