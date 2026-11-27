package com.codehub.backend.service;

import com.codehub.backend.dto.SubmissionDto;
import com.codehub.backend.model.*;
import com.codehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final LeaderboardService leaderboardService;
    private final JudgeEngine judgeEngine;
    private final ContestService contestService;

    public SubmissionDto.RunResponse runCode(SubmissionDto.RunRequest req) {
        Problem problem = problemRepository.findById(req.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + req.getProblemId()));

        List<SubmissionDto.ResultDetail> details = new ArrayList<>();
        boolean allPassed = true;
        long totalTime = 0;
        long maxMemory = 0;
        SubmissionStatus overallStatus = SubmissionStatus.ACCEPTED;
        String combinedStdout = "";
        String combinedStderr = "";

        // If custom input provided
        if (req.getCustomInput() != null && !req.getCustomInput().trim().isEmpty()) {
            JudgeEngine.ExecutionResult exec = judgeEngine.execute(
                    req.getProgrammingLanguage(), req.getSourceCode(), req.getCustomInput().trim()
            );

            boolean isOk = exec.getStatus() == ResultStatus.PASSED;
            details.add(SubmissionDto.ResultDetail.builder()
                    .testCaseId(0L)
                    .testCaseOrder(1)
                    .status(exec.getStatus())
                    .input(req.getCustomInput().trim())
                    .actualOutput(exec.getStdout())
                    .expectedOutput("Custom Input Execution")
                    .executionTimeMs(exec.getExecutionTimeMs())
                    .memoryUsedKb(exec.getMemoryUsedKb())
                    .isHidden(false)
                    .build());

            return SubmissionDto.RunResponse.builder()
                    .status(isOk ? SubmissionStatus.ACCEPTED : SubmissionStatus.RUNTIME_ERROR)
                    .stdout(exec.getStdout())
                    .stderr(exec.getStderr())
                    .executionTimeMs(exec.getExecutionTimeMs())
                    .memoryUsedKb(exec.getMemoryUsedKb())
                    .passed(isOk)
                    .actualOutput(exec.getStdout())
                    .testCaseResults(details)
                    .build();
        }

        // Run against visible sample test cases
        List<TestCase> sampleCases = testCaseRepository.findByProblemIdAndIsHiddenFalseOrderByTestCaseOrderAsc(problem.getId());
        if (sampleCases.isEmpty()) {
            sampleCases = testCaseRepository.findByProblemIdOrderByTestCaseOrderAsc(problem.getId());
        }

        for (TestCase tc : sampleCases) {
            JudgeEngine.ExecutionResult exec = judgeEngine.execute(
                    req.getProgrammingLanguage(), req.getSourceCode(), tc.getInputData()
            );

            totalTime += exec.getExecutionTimeMs();
            maxMemory = Math.max(maxMemory, exec.getMemoryUsedKb());

            boolean matches = judgeEngine.compareOutputs(exec.getStdout(), tc.getExpectedOutput());
            ResultStatus caseStatus;

            if (exec.getStatus() == ResultStatus.COMPILATION_ERROR) {
                caseStatus = ResultStatus.COMPILATION_ERROR;
                overallStatus = SubmissionStatus.COMPILATION_ERROR;
                allPassed = false;
                combinedStderr = exec.getStderr();
            } else if (exec.getStatus() == ResultStatus.TIME_LIMIT_EXCEEDED) {
                caseStatus = ResultStatus.TIME_LIMIT_EXCEEDED;
                overallStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
                allPassed = false;
            } else if (exec.getStatus() == ResultStatus.RUNTIME_ERROR) {
                caseStatus = ResultStatus.RUNTIME_ERROR;
                overallStatus = SubmissionStatus.RUNTIME_ERROR;
                allPassed = false;
                combinedStderr = exec.getStderr();
            } else if (matches) {
                caseStatus = ResultStatus.PASSED;
            } else {
                caseStatus = ResultStatus.FAILED;
                if (overallStatus == SubmissionStatus.ACCEPTED) {
                    overallStatus = SubmissionStatus.WRONG_ANSWER;
                }
                allPassed = false;
            }

            details.add(SubmissionDto.ResultDetail.builder()
                    .testCaseId(tc.getId())
                    .testCaseOrder(tc.getTestCaseOrder())
                    .status(caseStatus)
                    .input(tc.getInputData())
                    .expectedOutput(tc.getExpectedOutput())
                    .actualOutput(exec.getStdout())
                    .executionTimeMs(exec.getExecutionTimeMs())
                    .memoryUsedKb(exec.getMemoryUsedKb())
                    .isHidden(tc.isHidden())
                    .build());

            if (exec.getStdout() != null && !exec.getStdout().isEmpty()) {
                combinedStdout += exec.getStdout() + "\n";
            }
        }

        return SubmissionDto.RunResponse.builder()
                .status(overallStatus)
                .stdout(combinedStdout.trim())
                .stderr(combinedStderr.trim())
                .executionTimeMs(sampleCases.isEmpty() ? 0 : totalTime / sampleCases.size())
                .memoryUsedKb(maxMemory)
                .passed(allPassed)
                .testCaseResults(details)
                .build();
    }

    @Transactional
    public SubmissionDto.Response submit(SubmissionDto.SubmitRequest req, User user) {
        Problem problem = problemRepository.findById(req.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + req.getProblemId()));

        if (req.getContestId() != null && user != null && user.getUserRole() != UserRole.ADMIN) {
            if (!contestService.isUserRegisteredForContest(req.getContestId(), user.getId())) {
                throw new RuntimeException("You are not registered for this contest. Only participants who registered before the contest started can submit solutions.");
            }
        }

        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .programmingLanguage(req.getProgrammingLanguage())
                .sourceCode(req.getSourceCode())
                .contestId(req.getContestId())
                .submissionStatus(SubmissionStatus.RUNNING)
                .build();

        Submission savedSubmission = submissionRepository.save(submission);

        List<TestCase> allCases = testCaseRepository.findByProblemIdOrderByTestCaseOrderAsc(problem.getId());
        List<SubmissionResult> resultsToSave = new ArrayList<>();
        List<SubmissionDto.ResultDetail> details = new ArrayList<>();

        SubmissionStatus finalStatus = SubmissionStatus.ACCEPTED;
        long totalExecutionTime = 0;
        long maxMemoryUsed = 0;
        int passedCount = 0;

        for (TestCase tc : allCases) {
            JudgeEngine.ExecutionResult exec = judgeEngine.execute(
                    req.getProgrammingLanguage(), req.getSourceCode(), tc.getInputData()
            );

            totalExecutionTime += exec.getExecutionTimeMs();
            maxMemoryUsed = Math.max(maxMemoryUsed, exec.getMemoryUsedKb());

            boolean matches = judgeEngine.compareOutputs(exec.getStdout(), tc.getExpectedOutput());
            ResultStatus resultStatus;

            if (exec.getStatus() == ResultStatus.COMPILATION_ERROR) {
                resultStatus = ResultStatus.COMPILATION_ERROR;
                if (finalStatus == SubmissionStatus.ACCEPTED) finalStatus = SubmissionStatus.COMPILATION_ERROR;
            } else if (exec.getStatus() == ResultStatus.TIME_LIMIT_EXCEEDED) {
                resultStatus = ResultStatus.TIME_LIMIT_EXCEEDED;
                if (finalStatus == SubmissionStatus.ACCEPTED) finalStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
            } else if (exec.getStatus() == ResultStatus.RUNTIME_ERROR) {
                resultStatus = ResultStatus.RUNTIME_ERROR;
                if (finalStatus == SubmissionStatus.ACCEPTED) finalStatus = SubmissionStatus.RUNTIME_ERROR;
            } else if (matches) {
                resultStatus = ResultStatus.PASSED;
                passedCount++;
            } else {
                resultStatus = ResultStatus.FAILED;
                if (finalStatus == SubmissionStatus.ACCEPTED) finalStatus = SubmissionStatus.WRONG_ANSWER;
            }

            SubmissionResult sr = SubmissionResult.builder()
                    .submission(savedSubmission)
                    .testCase(tc)
                    .resultStatus(resultStatus)
                    .actualOutput(exec.getStdout())
                    .executionTimeMs(exec.getExecutionTimeMs())
                    .memoryUsedKb(exec.getMemoryUsedKb())
                    .build();

            resultsToSave.add(sr);

            details.add(SubmissionDto.ResultDetail.builder()
                    .testCaseId(tc.getId())
                    .testCaseOrder(tc.getTestCaseOrder())
                    .status(resultStatus)
                    .input(tc.isHidden() ? "[Hidden Test Case]" : tc.getInputData())
                    .expectedOutput(tc.isHidden() ? "[Hidden Test Case]" : tc.getExpectedOutput())
                    .actualOutput(tc.isHidden() && resultStatus != ResultStatus.PASSED ? "[Hidden Output]" : exec.getStdout())
                    .executionTimeMs(exec.getExecutionTimeMs())
                    .memoryUsedKb(exec.getMemoryUsedKb())
                    .isHidden(tc.isHidden())
                    .build());
        }

        submissionResultRepository.saveAll(resultsToSave);

        long avgTime = allCases.isEmpty() ? 0 : totalExecutionTime / allCases.size();
        savedSubmission.setSubmissionStatus(finalStatus);
        savedSubmission.setExecutionTimeMs(avgTime);
        savedSubmission.setMemoryUsedKb(maxMemoryUsed);

        Submission finishedSubmission = submissionRepository.save(savedSubmission);

        // Update leaderboard if solved
        if (finalStatus == SubmissionStatus.ACCEPTED) {
            leaderboardService.updateUserProgress(user, problem);
        }

        // Update contest stats if submission belongs to a contest
        if (finishedSubmission.getContestId() != null) {
            contestService.handleContestSubmission(finishedSubmission);
        }

        return mapToDto(finishedSubmission, allCases.size(), passedCount, details);
    }

    public List<SubmissionDto.Response> getUserSubmissions(Long userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId).stream()
                .map(s -> mapToDto(s, 0, 0, null))
                .collect(Collectors.toList());
    }

    public List<SubmissionDto.Response> getProblemSubmissions(Long problemId, User user) {
        List<Submission> list = user != null
                ? submissionRepository.findByUserIdAndProblemIdOrderBySubmittedAtDesc(user.getId(), problemId)
                : submissionRepository.findByProblemIdOrderBySubmittedAtDesc(problemId);

        return list.stream()
                .map(s -> mapToDto(s, 0, 0, null))
                .collect(Collectors.toList());
    }

    public List<SubmissionDto.Response> getAllSubmissions() {
        return submissionRepository.findAllByOrderBySubmittedAtDesc().stream()
                .limit(50)
                .map(s -> mapToDto(s, 0, 0, null))
                .collect(Collectors.toList());
    }

    private SubmissionDto.Response mapToDto(Submission s, int totalCases, int passedCases, List<SubmissionDto.ResultDetail> details) {
        return SubmissionDto.Response.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .userName(s.getUser().getName())
                .problemId(s.getProblem().getId())
                .problemTitle(s.getProblem().getTitle())
                .programmingLanguage(s.getProgrammingLanguage())
                .submissionStatus(s.getSubmissionStatus())
                .executionTimeMs(s.getExecutionTimeMs())
                .memoryUsedKb(s.getMemoryUsedKb())
                .submittedAt(s.getSubmittedAt())
                .contestId(s.getContestId())
                .sourceCode(s.getSourceCode())
                .totalTestCases(totalCases)
                .passedTestCases(passedCases)
                .results(details)
                .build();
    }
}
