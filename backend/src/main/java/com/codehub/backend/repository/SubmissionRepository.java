package com.codehub.backend.repository;

import com.codehub.backend.model.Submission;
import com.codehub.backend.model.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);
    List<Submission> findByProblemIdOrderBySubmittedAtDesc(Long problemId);
    List<Submission> findByUserIdAndProblemIdOrderBySubmittedAtDesc(Long userId, Long problemId);
    List<Submission> findByContestIdOrderBySubmittedAtDesc(Long contestId);
    List<Submission> findByContestIdAndUserIdOrderBySubmittedAtDesc(Long contestId, Long userId);
    List<Submission> findAllByOrderBySubmittedAtDesc();

    boolean existsByUserIdAndProblemIdAndSubmissionStatus(Long userId, Long problemId, SubmissionStatus submissionStatus);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.submissionStatus = :status")
    long countSolvedDistinctProblemsByUser(@Param("userId") Long userId, @Param("status") SubmissionStatus status);

    @Query("SELECT DISTINCT s.problem.id FROM Submission s WHERE s.user.id = :userId AND s.submissionStatus = :status")
    List<Long> findSolvedProblemIdsByUser(@Param("userId") Long userId, @Param("status") SubmissionStatus status);

    @Query("SELECT DISTINCT s.problem.id FROM Submission s WHERE s.user.id = :userId")
    List<Long> findAttemptedProblemIdsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT s.user.id) FROM Submission s WHERE s.problem.id = :problemId")
    long countDistinctUsersByProblemId(@Param("problemId") Long problemId);

    long countByProblemId(Long problemId);
    long countByProblemIdAndSubmissionStatus(Long problemId, SubmissionStatus submissionStatus);
    long countBySubmissionStatus(SubmissionStatus status);
}
