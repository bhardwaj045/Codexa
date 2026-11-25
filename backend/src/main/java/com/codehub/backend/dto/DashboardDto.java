package com.codehub.backend.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

public class DashboardDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentDashboard {
        private Long userId;
        private String name;
        private int problemsSolved;
        private int totalPoints;
        private Integer rankPosition;
        private long totalAvailableProblems;
        private long easySolved;
        private long easyTotal;
        private long mediumSolved;
        private long mediumTotal;
        private long hardSolved;
        private long hardTotal;
        private double acceptanceRate;
        private long acceptedSubmissions;
        private int currentStreak;
        private int maxStreak;
        private long totalSubmissions;
        private Map<String, Integer> submissionCalendar;
        private ProblemDto nextChallenge;
        private Map<String, Integer> topicBreakdown;
        private List<SubmissionDto.Response> recentSubmissions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboard {
        private long totalUsers;
        private long totalStudents;
        private long totalAdmins;
        private long totalProblems;
        private long easyProblems;
        private long mediumProblems;
        private long hardProblems;
        private long totalSubmissions;
        private long acceptedSubmissions;
        private double overallAcceptanceRate;
        private int maxAllowedUsers;
        private long remainingRegistrationSpots;
        private boolean registrationEnabled;
        private List<SubmissionDto.Response> recentSubmissions;
        private List<UserDto> registeredUsers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegistrationLimitResponse {
        private int maxUsers;
        private long currentUsers;
        private long remainingSpots;
        private boolean registrationEnabled;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegistrationLimitRequest {
        private int maxUsers;
        private Boolean registrationEnabled;
    }
}
