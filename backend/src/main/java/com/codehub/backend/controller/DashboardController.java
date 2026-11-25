package com.codehub.backend.controller;

import com.codehub.backend.dto.DashboardDto;
import com.codehub.backend.dto.UserDto;
import com.codehub.backend.model.User;
import com.codehub.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/student")
    public ResponseEntity<DashboardDto.StudentDashboard> getStudentDashboard(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(dashboardService.getStudentDashboard(user));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardDto.AdminDashboard> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getRegisteredUsers() {
        return ResponseEntity.ok(dashboardService.getAllUsers());
    }

    @GetMapping("/registration-limit")
    public ResponseEntity<DashboardDto.RegistrationLimitResponse> getRegistrationLimit() {
        return ResponseEntity.ok(dashboardService.getRegistrationLimit());
    }

    @PutMapping("/registration-limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardDto.RegistrationLimitResponse> updateRegistrationLimit(
            @RequestBody DashboardDto.RegistrationLimitRequest request) {
        return ResponseEntity.ok(dashboardService.updateRegistrationLimit(request));
    }
}
