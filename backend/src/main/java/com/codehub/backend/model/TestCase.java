package com.codehub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "test_cases",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_problem_test_case_order", columnNames = {"problem_id", "test_case_order"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "input_data", nullable = false, columnDefinition = "LONGTEXT")
    private String inputData;

    @Column(name = "expected_output", nullable = false, columnDefinition = "LONGTEXT")
    private String expectedOutput;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean isHidden = false;

    @Column(name = "test_case_order", nullable = false)
    @Builder.Default
    private int testCaseOrder = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
