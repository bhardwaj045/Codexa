package com.codehub.backend.dto;

import com.codehub.backend.model.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Difficulty is required")
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
}
