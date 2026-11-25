package com.codehub.backend.controller;

import com.codehub.backend.dto.SubmissionDto;
import com.codehub.backend.model.User;
import com.codehub.backend.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/run")
    public ResponseEntity<SubmissionDto.RunResponse> runCode(
            @Valid @RequestBody SubmissionDto.RunRequest request) {
        return ResponseEntity.ok(submissionService.runCode(request));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submit(
            @Valid @RequestBody SubmissionDto.SubmitRequest request,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Please log in to submit your solution."));
        }
        return ResponseEntity.ok(submissionService.submit(request, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SubmissionDto.Response>> getMySubmissions(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(submissionService.getUserSubmissions(user.getId()));
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<SubmissionDto.Response>> getProblemSubmissions(
            @PathVariable Long problemId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(submissionService.getProblemSubmissions(problemId, user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<SubmissionDto.Response>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }
}
