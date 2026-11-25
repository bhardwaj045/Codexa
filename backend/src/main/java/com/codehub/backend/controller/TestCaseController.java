package com.codehub.backend.controller;

import com.codehub.backend.dto.TestCaseDto;
import com.codehub.backend.model.User;
import com.codehub.backend.model.UserRole;
import com.codehub.backend.service.TestCaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems/{problemId}/test-cases")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    @GetMapping
    public ResponseEntity<List<TestCaseDto.Response>> getTestCases(
            @PathVariable Long problemId,
            @RequestParam(required = false, defaultValue = "false") boolean includeHidden,
            @AuthenticationPrincipal User currentUser) {
        boolean canSeeHidden = currentUser != null && currentUser.getUserRole() == UserRole.ADMIN;
        return ResponseEntity.ok(testCaseService.getTestCases(problemId, canSeeHidden && includeHidden));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TestCaseDto.Response> addTestCase(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseDto.Request request) {
        return ResponseEntity.ok(testCaseService.addTestCase(problemId, request));
    }

    @PutMapping("/{testCaseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TestCaseDto.Response> updateTestCase(
            @PathVariable Long problemId,
            @PathVariable Long testCaseId,
            @Valid @RequestBody TestCaseDto.Request request) {
        return ResponseEntity.ok(testCaseService.updateTestCase(testCaseId, request));
    }

    @DeleteMapping("/{testCaseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTestCase(
            @PathVariable Long problemId,
            @PathVariable Long testCaseId) {
        testCaseService.deleteTestCase(testCaseId);
        return ResponseEntity.noContent().build();
    }
}
