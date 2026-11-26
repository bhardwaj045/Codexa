package com.codehub.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contest_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "problem_order", nullable = false)
    private Integer problemOrder; // 1, 2, 3, 4, 5 (A, B, C, D, E)

    @Column(name = "points", nullable = false)
    @Builder.Default
    private Integer points = 100;
}
