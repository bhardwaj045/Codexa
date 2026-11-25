package com.codehub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(length = 100)
    private String topic;

    @Column(name = "problem_constraints", columnDefinition = "TEXT")
    private String problemConstraints;

    @Column(name = "sample_input", columnDefinition = "LONGTEXT")
    private String sampleInput;

    @Column(name = "sample_output", columnDefinition = "LONGTEXT")
    private String sampleOutput;

    @Column(columnDefinition = "LONGTEXT")
    private String hints;

    @Column(name = "solution_code", columnDefinition = "LONGTEXT")
    private String solutionCode;

    @Column(name = "solution_approach", columnDefinition = "TEXT")
    private String solutionApproach;

    @Column(columnDefinition = "LONGTEXT")
    private String editorial;

    @Column(name = "starter_code", columnDefinition = "LONGTEXT")
    private String starterCode;

    @Column(length = 500)
    private String companies;

    @Column(name = "follow_up", columnDefinition = "TEXT")
    private String followUp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
