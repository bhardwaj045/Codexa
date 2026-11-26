package com.codehub.backend.dto;

import com.codehub.backend.model.ProgrammingLanguage;
import com.codehub.backend.model.ResultStatus;
import com.codehub.backend.model.SubmissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class SubmissionDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitRequest {
        @NotNull(message = "Problem ID is required")
        private Long problemId;

        @NotNull(message = "Programming language is required")
        private ProgrammingLanguage programmingLanguage;

        @NotBlank(message = "Source code is required")
        private String sourceCode;

        private Long contestId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RunRequest {
        @NotNull(message = "Problem ID is required")
        private Long problemId;

        @NotNull(message = "Programming language is required")
        private ProgrammingLanguage programmingLanguage;

        @NotBlank(message = "Source code is required")
        private String sourceCode;

        private String customInput;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResultDetail {
        private Long testCaseId;
        private int testCaseOrder;
        private ResultStatus status;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private Long executionTimeMs;
        private Long memoryUsedKb;
        private boolean isHidden;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RunResponse {
        private SubmissionStatus status;
        private String stdout;
        private String stderr;
        private Long executionTimeMs;
        private Long memoryUsedKb;
        private boolean passed;
        private String expectedOutput;
        private String actualOutput;
        private List<ResultDetail> testCaseResults;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private String userName;
        private Long problemId;
        private String problemTitle;
        private ProgrammingLanguage programmingLanguage;
        private SubmissionStatus submissionStatus;
        private Long executionTimeMs;
        private Long memoryUsedKb;
        private LocalDateTime submittedAt;
        private String sourceCode;
        private Long contestId;
        private int totalTestCases;
        private int passedTestCases;
        private List<ResultDetail> results;
    }
}
