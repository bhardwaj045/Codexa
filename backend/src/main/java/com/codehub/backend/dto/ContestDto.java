package com.codehub.backend.dto;

import com.codehub.backend.model.ContestStatus;
import com.codehub.backend.model.Difficulty;
import com.codehub.backend.model.ProgrammingLanguage;
import com.codehub.backend.model.SubmissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ContestDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Contest title is required")
        private String title;

        private String description;

        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;

        @Builder.Default
        private Integer durationMinutes = 120; // 2 hours

        private List<Long> problemIds; // Optional list of 5 problem IDs
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProblemAssignItem {
        private Long problemId;
        private Integer points;
        private Integer problemOrder;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContestProblemResponse {
        private Long id;
        private Long problemId;
        private String title;
        private Difficulty difficulty;
        private String topic;
        private Integer problemOrder;
        private String orderLabel; // 'A', 'B', 'C', 'D', 'E'
        private Integer points;
        private Boolean isSolved;
        private Long attemptedCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer durationMinutes;
        private ContestStatus status;
        private Integer totalProblems;
        private Long totalParticipants;
        private Boolean isRegistered;
        private String createdByName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer durationMinutes;
        private ContestStatus status;
        private Long totalParticipants;
        private Boolean isRegistered;
        private List<ContestProblemResponse> problems;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LeaderboardEntryResponse {
        private Integer rank;
        private Long userId;
        private String userName;
        private Integer score;
        private Integer problemsSolved;
        private Long penaltyMinutes;
        private Map<Long, ProblemScoreStatus> problemResults;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProblemScoreStatus {
        private Boolean solved;
        private Integer points;
        private Integer attempts;
        private Long solvedMinutes; // Minutes since contest start
    }
}
