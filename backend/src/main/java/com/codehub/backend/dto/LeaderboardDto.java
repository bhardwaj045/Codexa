package com.codehub.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardDto {
    private int rank;
    private Long userId;
    private String name;
    private String email;
    private int problemsSolved;
    private int totalPoints;
    private LocalDateTime updatedAt;
}
