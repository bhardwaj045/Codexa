package com.codehub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "submission_results",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_submission_test_case", columnNames = {"submission_id", "test_case_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id")
    private TestCase testCase;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_status", nullable = false)
    @Builder.Default
    private ResultStatus resultStatus = ResultStatus.PENDING;

    @Column(name = "actual_output", columnDefinition = "LONGTEXT")
    private String actualOutput;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "memory_used_kb")
    private Long memoryUsedKb;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
