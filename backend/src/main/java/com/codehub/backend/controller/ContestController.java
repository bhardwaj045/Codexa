package com.codehub.backend.controller;

import com.codehub.backend.dto.ContestDto;
import com.codehub.backend.dto.SubmissionDto;
import com.codehub.backend.model.User;
import com.codehub.backend.model.UserRole;
import com.codehub.backend.service.ContestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @GetMapping
    public ResponseEntity<List<ContestDto.SummaryResponse>> getAllContests(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(contestService.getAllContests(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestDto.DetailResponse> getContestDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(contestService.getContestDetail(id, user));
    }

    @PostMapping
    public ResponseEntity<?> createContest(
            @Valid @RequestBody ContestDto.CreateRequest request,
            @AuthenticationPrincipal User user) {
        if (user == null || user.getUserRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only administrators can create contests."));
        }
        return ResponseEntity.ok(contestService.createContest(request, user));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishContest(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null || user.getUserRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only administrators can publish contests."));
        }
        return ResponseEntity.ok(contestService.publishContest(id));
    }

    @PostMapping("/{id}/start-now")
    public ResponseEntity<?> startContestNow(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null || user.getUserRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only administrators can start contests."));
        }
        return ResponseEntity.ok(contestService.startContestNow(id));
    }

    @PostMapping("/{id}/problems")
    public ResponseEntity<?> assignProblems(
            @PathVariable Long id,
            @RequestBody List<ContestDto.ProblemAssignItem> items,
            @AuthenticationPrincipal User user) {
        if (user == null || user.getUserRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only administrators can modify contest problems."));
        }
        return ResponseEntity.ok(contestService.assignProblems(id, items, user));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinContest(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Please sign in to register for the contest."));
        }
        return ResponseEntity.ok(contestService.joinContest(id, user));
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<ContestDto.LeaderboardEntryResponse>> getContestLeaderboard(
            @PathVariable Long id) {
        return ResponseEntity.ok(contestService.getContestLeaderboard(id));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<SubmissionDto.Response>> getContestSubmissions(
            @PathVariable Long id) {
        return ResponseEntity.ok(contestService.getContestSubmissions(id));
    }
}
