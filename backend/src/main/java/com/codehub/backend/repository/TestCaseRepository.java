package com.codehub.backend.repository;

import com.codehub.backend.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblemIdOrderByTestCaseOrderAsc(Long problemId);
    List<TestCase> findByProblemIdAndIsHiddenFalseOrderByTestCaseOrderAsc(Long problemId);
    void deleteByProblemId(Long problemId);
    long countByProblemId(Long problemId);
}
