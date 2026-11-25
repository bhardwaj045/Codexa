package com.codehub.backend.controller;

import com.codehub.backend.dto.ProblemDto;
import com.codehub.backend.dto.ProblemRequest;
import com.codehub.backend.model.Difficulty;
import com.codehub.backend.model.User;
import com.codehub.backend.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<ProblemDto>> getProblems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) String topic,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(problemService.getProblems(query, difficulty, topic, currentUser));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics() {
        return ResponseEntity.ok(problemService.getAllTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemDto> getProblemById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(problemService.getProblemById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemDto> createProblem(
            @Valid @RequestBody ProblemRequest request,
            @AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(problemService.createProblem(request, adminUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemDto> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.updateProblem(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}
