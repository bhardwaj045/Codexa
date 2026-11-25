package com.codehub.backend.service;

import com.codehub.backend.dto.TestCaseDto;
import com.codehub.backend.model.Problem;
import com.codehub.backend.model.TestCase;
import com.codehub.backend.repository.ProblemRepository;
import com.codehub.backend.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public List<TestCaseDto.Response> getTestCases(Long problemId, boolean includeHidden) {
        List<TestCase> cases = includeHidden
                ? testCaseRepository.findByProblemIdOrderByTestCaseOrderAsc(problemId)
                : testCaseRepository.findByProblemIdAndIsHiddenFalseOrderByTestCaseOrderAsc(problemId);

        return cases.stream().map(tc -> TestCaseDto.Response.builder()
                .id(tc.getId())
                .problemId(tc.getProblem().getId())
                .inputData(tc.getInputData())
                .expectedOutput(tc.getExpectedOutput())
                .isHidden(tc.isHidden())
                .testCaseOrder(tc.getTestCaseOrder())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public TestCaseDto.Response addTestCase(Long problemId, TestCaseDto.Request req) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + problemId));

        int order = req.getTestCaseOrder() != null && req.getTestCaseOrder() > 0
                ? req.getTestCaseOrder()
                : (int) testCaseRepository.countByProblemId(problemId) + 1;

        TestCase testCase = TestCase.builder()
                .problem(problem)
                .inputData(req.getInputData())
                .expectedOutput(req.getExpectedOutput())
                .isHidden(req.isHidden())
                .testCaseOrder(order)
                .build();

        TestCase saved = testCaseRepository.save(testCase);

        return TestCaseDto.Response.builder()
                .id(saved.getId())
                .problemId(saved.getProblem().getId())
                .inputData(saved.getInputData())
                .expectedOutput(saved.getExpectedOutput())
                .isHidden(saved.isHidden())
                .testCaseOrder(saved.getTestCaseOrder())
                .build();
    }

    @Transactional
    public TestCaseDto.Response updateTestCase(Long testCaseId, TestCaseDto.Request req) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new RuntimeException("Test case not found with ID: " + testCaseId));

        testCase.setInputData(req.getInputData());
        testCase.setExpectedOutput(req.getExpectedOutput());
        testCase.setHidden(req.isHidden());
        if (req.getTestCaseOrder() != null && req.getTestCaseOrder() > 0) {
            testCase.setTestCaseOrder(req.getTestCaseOrder());
        }

        TestCase saved = testCaseRepository.save(testCase);

        return TestCaseDto.Response.builder()
                .id(saved.getId())
                .problemId(saved.getProblem().getId())
                .inputData(saved.getInputData())
                .expectedOutput(saved.getExpectedOutput())
                .isHidden(saved.isHidden())
                .testCaseOrder(saved.getTestCaseOrder())
                .build();
    }

    @Transactional
    public void deleteTestCase(Long testCaseId) {
        if (!testCaseRepository.existsById(testCaseId)) {
            throw new RuntimeException("Test case not found with ID: " + testCaseId);
        }
        testCaseRepository.deleteById(testCaseId);
    }
}
