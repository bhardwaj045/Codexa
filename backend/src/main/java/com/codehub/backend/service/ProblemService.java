package com.codehub.backend.service;

import com.codehub.backend.dto.ProblemDto;
import com.codehub.backend.dto.ProblemRequest;
import com.codehub.backend.model.Difficulty;
import com.codehub.backend.model.Problem;
import com.codehub.backend.model.SubmissionStatus;
import com.codehub.backend.model.User;
import com.codehub.backend.repository.ProblemRepository;
import com.codehub.backend.repository.SubmissionRepository;
import com.codehub.backend.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;

    public List<ProblemDto> getProblems(String query, Difficulty difficulty, String topic, User currentUser) {
        List<Problem> problems = problemRepository.searchProblems(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                difficulty,
                (topic != null && !topic.trim().isEmpty() && !topic.equalsIgnoreCase("all")) ? topic.trim() : null
        );

        Set<Long> solvedProblemIds = new HashSet<>();
        Set<Long> attemptedProblemIds = new HashSet<>();

        if (currentUser != null) {
            solvedProblemIds.addAll(submissionRepository.findSolvedProblemIdsByUser(currentUser.getId(), SubmissionStatus.ACCEPTED));
            attemptedProblemIds.addAll(submissionRepository.findAttemptedProblemIdsByUser(currentUser.getId()));
        }

        return problems.stream().map(p -> {
            String status = "UNSOLVED";
            if (solvedProblemIds.contains(p.getId())) {
                status = "SOLVED";
            } else if (attemptedProblemIds.contains(p.getId())) {
                status = "ATTEMPTED";
            }

            int testCasesCount = (int) testCaseRepository.countByProblemId(p.getId());
            long totalSubs = submissionRepository.countByProblemId(p.getId());
            long acceptedSubs = submissionRepository.countByProblemIdAndSubmissionStatus(p.getId(), SubmissionStatus.ACCEPTED);
            long attemptedUsers = submissionRepository.countDistinctUsersByProblemId(p.getId());

            return ProblemDto.builder()
                    .id(p.getId())
                    .title(p.getTitle())
                    .description(p.getDescription())
                    .difficulty(p.getDifficulty())
                    .topic(p.getTopic())
                    .problemConstraints(p.getProblemConstraints())
                    .sampleInput(p.getSampleInput())
                    .sampleOutput(p.getSampleOutput())
                    .hints(p.getHints())
                    .solutionCode(p.getSolutionCode())
                    .solutionApproach(p.getSolutionApproach())
                    .editorial(p.getEditorial())
                    .starterCode(p.getStarterCode())
                    .companies(p.getCompanies())
                    .followUp(p.getFollowUp())
                    .createdById(p.getCreatedBy() != null ? p.getCreatedBy().getId() : null)
                    .createdByName(p.getCreatedBy() != null ? p.getCreatedBy().getName() : "Admin")
                    .createdAt(p.getCreatedAt())
                    .updatedAt(p.getUpdatedAt())
                    .status(status)
                    .testCasesCount(testCasesCount)
                    .totalSubmissions(totalSubs)
                    .acceptedSubmissions(acceptedSubs)
                    .attemptedUsersCount(attemptedUsers)
                    .build();
        }).collect(Collectors.toList());
    }

    public ProblemDto getProblemById(Long id, User currentUser) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + id));

        String status = "UNSOLVED";
        if (currentUser != null) {
            boolean solved = submissionRepository.existsByUserIdAndProblemIdAndSubmissionStatus(
                    currentUser.getId(), p.getId(), SubmissionStatus.ACCEPTED
            );
            if (solved) {
                status = "SOLVED";
            } else {
                boolean attempted = !submissionRepository.findByUserIdAndProblemIdOrderBySubmittedAtDesc(currentUser.getId(), p.getId()).isEmpty();
                if (attempted) {
                    status = "ATTEMPTED";
                }
            }
        }

        int testCasesCount = (int) testCaseRepository.countByProblemId(p.getId());
        long totalSubs = submissionRepository.countByProblemId(p.getId());
        long acceptedSubs = submissionRepository.countByProblemIdAndSubmissionStatus(p.getId(), SubmissionStatus.ACCEPTED);
        long attemptedUsers = submissionRepository.countDistinctUsersByProblemId(p.getId());

        return ProblemDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .difficulty(p.getDifficulty())
                .topic(p.getTopic())
                .problemConstraints(p.getProblemConstraints())
                .sampleInput(p.getSampleInput())
                .sampleOutput(p.getSampleOutput())
                .hints(p.getHints())
                .solutionCode(p.getSolutionCode())
                .solutionApproach(p.getSolutionApproach())
                .editorial(p.getEditorial())
                .starterCode(p.getStarterCode())
                .companies(p.getCompanies())
                .followUp(p.getFollowUp())
                .createdById(p.getCreatedBy() != null ? p.getCreatedBy().getId() : null)
                .createdByName(p.getCreatedBy() != null ? p.getCreatedBy().getName() : "Admin")
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .status(status)
                .testCasesCount(testCasesCount)
                .totalSubmissions(totalSubs)
                .acceptedSubmissions(acceptedSubs)
                .attemptedUsersCount(attemptedUsers)
                .build();
    }

    @Transactional
    public ProblemDto createProblem(ProblemRequest req, User adminUser) {
        Problem problem = Problem.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .difficulty(req.getDifficulty())
                .topic(req.getTopic())
                .problemConstraints(req.getProblemConstraints())
                .sampleInput(req.getSampleInput())
                .sampleOutput(req.getSampleOutput())
                .hints(req.getHints())
                .solutionCode(req.getSolutionCode())
                .solutionApproach(req.getSolutionApproach())
                .editorial(req.getEditorial())
                .starterCode(req.getStarterCode())
                .companies(req.getCompanies())
                .followUp(req.getFollowUp())
                .createdBy(adminUser)
                .build();

        Problem saved = problemRepository.save(problem);
        return getProblemById(saved.getId(), adminUser);
    }

    @Transactional
    public ProblemDto updateProblem(Long id, ProblemRequest req) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + id));

        problem.setTitle(req.getTitle());
        problem.setDescription(req.getDescription());
        problem.setDifficulty(req.getDifficulty());
        problem.setTopic(req.getTopic());
        problem.setProblemConstraints(req.getProblemConstraints());
        problem.setSampleInput(req.getSampleInput());
        problem.setSampleOutput(req.getSampleOutput());
        problem.setHints(req.getHints());
        problem.setSolutionCode(req.getSolutionCode());
        problem.setSolutionApproach(req.getSolutionApproach());
        problem.setEditorial(req.getEditorial());
        problem.setStarterCode(req.getStarterCode());
        problem.setCompanies(req.getCompanies());
        problem.setFollowUp(req.getFollowUp());

        Problem saved = problemRepository.save(problem);
        return getProblemById(saved.getId(), null);
    }

    @Transactional
    public void deleteProblem(Long id) {
        if (!problemRepository.existsById(id)) {
            throw new RuntimeException("Problem not found with ID: " + id);
        }
        problemRepository.deleteById(id);
    }

    public List<String> getAllTopics() {
        return problemRepository.findDistinctTopics();
    }
}
