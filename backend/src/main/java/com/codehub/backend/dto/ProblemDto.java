package com.codehub.backend.dto;

import com.codehub.backend.model.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemDto {
    private Long id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String topic;
    private String problemConstraints;
    private String sampleInput;
    private String sampleOutput;
    private String hints;
    private String solutionCode;
    private String solutionApproach;
    private String editorial;
    private String starterCode;
    private String companies;
    private String followUp;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status; // SOLVED, ATTEMPTED, UNSOLVED
    private int testCasesCount;
    private long totalSubmissions;
    private long acceptedSubmissions;
    private long attemptedUsersCount;
}
