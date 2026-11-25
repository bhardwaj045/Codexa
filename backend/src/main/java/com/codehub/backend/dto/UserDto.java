package com.codehub.backend.dto;

import com.codehub.backend.model.UserRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private UserRole userRole;
    private LocalDateTime createdAt;
    private int problemsSolved;
    private int totalPoints;
    private Integer rankPosition;
    private long totalSubmissions;
}
