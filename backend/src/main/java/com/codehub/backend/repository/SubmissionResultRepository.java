package com.codehub.backend.repository;

import com.codehub.backend.model.SubmissionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionResultRepository extends JpaRepository<SubmissionResult, Long> {
    List<SubmissionResult> findBySubmissionIdOrderByIdAsc(Long submissionId);
    void deleteBySubmissionId(Long submissionId);
}
