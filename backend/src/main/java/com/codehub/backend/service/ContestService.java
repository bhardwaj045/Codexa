package com.codehub.backend.service;

import com.codehub.backend.dto.ContestDto;
import com.codehub.backend.dto.SubmissionDto;
import com.codehub.backend.model.*;
import com.codehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {

    private final ContestRepository contestRepository;
    private final ContestProblemRepository contestProblemRepository;
    private final ContestParticipantRepository contestParticipantRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;

    private static final String[] ORDER_LABELS = {"A", "B", "C", "D", "E", "F", "G", "H"};

    @Transactional
    public ContestDto.DetailResponse createContest(ContestDto.CreateRequest req, User admin) {
        int duration = (req.getDurationMinutes() != null && req.getDurationMinutes() > 0)
                ? req.getDurationMinutes() : 120; // Default 2 hours

        LocalDateTime startTime = req.getStartTime() != null ? req.getStartTime() : LocalDateTime.now();
        LocalDateTime endTime = startTime.plusMinutes(duration);

        Contest contest = Contest.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(duration)
                .status(ContestStatus.DRAFT)
                .createdBy(admin)
                .build();

        Contest saved = contestRepository.save(contest);

        // Assign problems if provided (up to 5)
        if (req.getProblemIds() != null && !req.getProblemIds().isEmpty()) {
            int order = 1;
            int defaultPoints = 100;
            for (Long probId : req.getProblemIds()) {
                Problem p = problemRepository.findById(probId).orElse(null);
                if (p != null) {
                    ContestProblem cp = ContestProblem.builder()
                            .contest(saved)
                            .problem(p)
                            .problemOrder(order)
                            .points(defaultPoints)
                            .build();
                    contestProblemRepository.save(cp);
                    order++;
                    defaultPoints += 100; // 100, 200, 300, 400, 500
                }
            }
        }

        return getContestDetail(saved.getId(), admin);
    }

    @Transactional
    public ContestDto.DetailResponse assignProblems(Long contestId, List<ContestDto.ProblemAssignItem> items, User admin) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found with ID: " + contestId));

        contestProblemRepository.deleteByContestId(contestId);

        int fallbackOrder = 1;
        for (ContestDto.ProblemAssignItem item : items) {
            Problem p = problemRepository.findById(item.getProblemId()).orElse(null);
            if (p != null) {
                int order = (item.getProblemOrder() != null && item.getProblemOrder() > 0)
                        ? item.getProblemOrder() : fallbackOrder;
                int points = (item.getPoints() != null && item.getPoints() > 0)
                        ? item.getPoints() : 100 * order;

                ContestProblem cp = ContestProblem.builder()
                        .contest(contest)
                        .problem(p)
                        .problemOrder(order)
                        .points(points)
                        .build();
                contestProblemRepository.save(cp);
                fallbackOrder++;
            }
        }

        return getContestDetail(contestId, admin);
    }

    @Transactional
    public ContestDto.SummaryResponse publishContest(Long contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found with ID: " + contestId));

        contest.setStatus(ContestStatus.PUBLISHED);
        updateDynamicStatus(contest);
        Contest saved = contestRepository.save(contest);
        return mapToSummary(saved, null);
    }

    @Transactional
    public ContestDto.SummaryResponse startContestNow(Long contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found with ID: " + contestId));

        LocalDateTime now = LocalDateTime.now();
        contest.setStartTime(now);
        contest.setEndTime(now.plusMinutes(contest.getDurationMinutes()));
        contest.setStatus(ContestStatus.LIVE);
        Contest saved = contestRepository.save(contest);
        return mapToSummary(saved, null);
    }

    public List<ContestDto.SummaryResponse> getAllContests(User user) {
        List<Contest> all = contestRepository.findAllByOrderByStartTimeDesc();
        LocalDateTime now = LocalDateTime.now();

        for (Contest c : all) {
            updateDynamicStatus(c);
        }

        return all.stream()
                .map(c -> mapToSummary(c, user))
                .collect(Collectors.toList());
    }

    public ContestDto.DetailResponse getContestDetail(Long contestId, User user) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found with ID: " + contestId));

        updateDynamicStatus(contest);

        List<ContestProblem> cpList = contestProblemRepository.findByContestIdOrderByProblemOrderAsc(contestId);

        Set<Long> solvedProblemIds = new HashSet<>();
        if (user != null) {
            List<Submission> userSubs = submissionRepository.findByContestIdAndUserIdOrderBySubmittedAtDesc(contestId, user.getId());
            for (Submission s : userSubs) {
                if (s.getSubmissionStatus() == SubmissionStatus.ACCEPTED) {
                    solvedProblemIds.add(s.getProblem().getId());
                }
            }
        }

        List<ContestDto.ContestProblemResponse> problemResponses = new ArrayList<>();
        for (int i = 0; i < cpList.size(); i++) {
            ContestProblem cp = cpList.get(i);
            Problem p = cp.getProblem();
            String label = i < ORDER_LABELS.length ? ORDER_LABELS[i] : String.valueOf(i + 1);

            problemResponses.add(ContestDto.ContestProblemResponse.builder()
                    .id(cp.getId())
                    .problemId(p.getId())
                    .title(p.getTitle())
                    .difficulty(p.getDifficulty())
                    .topic(p.getTopic())
                    .problemOrder(cp.getProblemOrder())
                    .orderLabel(label)
                    .points(cp.getPoints())
                    .isSolved(solvedProblemIds.contains(p.getId()))
                    .attemptedCount(submissionRepository.countDistinctUsersByProblemId(p.getId()))
                    .build());
        }

        boolean isRegistered = user != null && contestParticipantRepository.existsByContestIdAndUserId(contestId, user.getId());
        long totalParticipants = contestParticipantRepository.countByContestId(contestId);

        return ContestDto.DetailResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .durationMinutes(contest.getDurationMinutes())
                .status(contest.getStatus())
                .totalParticipants(totalParticipants)
                .isRegistered(isRegistered)
                .problems(problemResponses)
                .build();
    }

    @Transactional
    public ContestDto.SummaryResponse joinContest(Long contestId, User user) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found with ID: " + contestId));

        if (user != null && user.getUserRole() == UserRole.ADMIN) {
            // Admins are contest organizers and do not register as contestants
            return mapToSummary(contest, user);
        }

        if (!contestParticipantRepository.existsByContestIdAndUserId(contestId, user.getId())) {
            ContestParticipant cp = ContestParticipant.builder()
                    .contest(contest)
                    .user(user)
                    .score(0)
                    .problemsSolved(0)
                    .penaltySeconds(0L)
                    .build();
            contestParticipantRepository.save(cp);
        }

        return mapToSummary(contest, user);
    }

    @Transactional
    public void handleContestSubmission(Submission submission) {
        if (submission.getContestId() == null) return;
        if (submission.getUser() != null && submission.getUser().getUserRole() == UserRole.ADMIN) {
            // Admins do not score in contest leaderboards
            return;
        }

        Long contestId = submission.getContestId();
        Contest contest = contestRepository.findById(contestId).orElse(null);
        if (contest == null) return;

        User user = submission.getUser();
        Problem problem = submission.getProblem();

        ContestParticipant participant = contestParticipantRepository.findByContestIdAndUserId(contestId, user.getId())
                .orElseGet(() -> contestParticipantRepository.save(ContestParticipant.builder()
                        .contest(contest)
                        .user(user)
                        .score(0)
                        .problemsSolved(0)
                        .penaltySeconds(0L)
                        .build()));

        ContestProblem cp = contestProblemRepository.findByContestIdAndProblemId(contestId, problem.getId()).orElse(null);
        if (cp == null) return;

        // Check if user already solved this problem in this contest
        List<Submission> previousAccepted = submissionRepository.findByContestIdAndUserIdOrderBySubmittedAtDesc(contestId, user.getId())
                .stream()
                .filter(s -> s.getProblem().getId().equals(problem.getId()) && s.getSubmissionStatus() == SubmissionStatus.ACCEPTED && !s.getId().equals(submission.getId()))
                .toList();

        if (previousAccepted.isEmpty() && submission.getSubmissionStatus() == SubmissionStatus.ACCEPTED) {
            // First time solving this problem in contest!
            participant.setScore(participant.getScore() + cp.getPoints());
            participant.setProblemsSolved(participant.getProblemsSolved() + 1);

            // Calculate penalty time (minutes since contest start + 20 min per failed attempt)
            long minutesSinceStart = Math.max(0, Duration.between(contest.getStartTime(), submission.getSubmittedAt()).toMinutes());
            long failedAttempts = submissionRepository.findByContestIdAndUserIdOrderBySubmittedAtDesc(contestId, user.getId())
                    .stream()
                    .filter(s -> s.getProblem().getId().equals(problem.getId()) && s.getSubmissionStatus() != SubmissionStatus.ACCEPTED && s.getSubmittedAt().isBefore(submission.getSubmittedAt()))
                    .count();

            long penaltyAddition = minutesSinceStart + (failedAttempts * 20);
            participant.setPenaltySeconds(participant.getPenaltySeconds() + (penaltyAddition * 60));
            contestParticipantRepository.save(participant);

            // Update rank positions for all participants in this contest
            recalculateLeaderboardRanks(contestId);
        }
    }

    public List<ContestDto.LeaderboardEntryResponse> getContestLeaderboard(Long contestId) {
        List<ContestParticipant> participants = contestParticipantRepository.findByContestIdOrderByScoreDescPenaltySecondsAsc(contestId);
        List<ContestProblem> cpList = contestProblemRepository.findByContestIdOrderByProblemOrderAsc(contestId);
        List<Submission> allContestSubs = submissionRepository.findByContestIdOrderBySubmittedAtDesc(contestId);

        List<ContestDto.LeaderboardEntryResponse> result = new ArrayList<>();
        int rank = 1;

        for (ContestParticipant p : participants) {
            if (p.getUser() != null && p.getUser().getUserRole() == UserRole.ADMIN) {
                continue; // Do not include administrators on the contestant leaderboard
            }
            Map<Long, ContestDto.ProblemScoreStatus> problemMap = new HashMap<>();

            for (ContestProblem cp : cpList) {
                Long probId = cp.getProblem().getId();
                List<Submission> probSubs = allContestSubs.stream()
                        .filter(s -> s.getUser().getId().equals(p.getUser().getId()) && s.getProblem().getId().equals(probId))
                        .sorted(Comparator.comparing(Submission::getSubmittedAt))
                        .toList();

                boolean solved = false;
                int attempts = 0;
                Long solvedMins = null;

                for (Submission s : probSubs) {
                    attempts++;
                    if (s.getSubmissionStatus() == SubmissionStatus.ACCEPTED) {
                        solved = true;
                        solvedMins = Math.max(0, Duration.between(cp.getContest().getStartTime(), s.getSubmittedAt()).toMinutes());
                        break;
                    }
                }

                problemMap.put(probId, ContestDto.ProblemScoreStatus.builder()
                        .solved(solved)
                        .points(solved ? cp.getPoints() : 0)
                        .attempts(attempts)
                        .solvedMinutes(solvedMins)
                        .build());
            }

            result.add(ContestDto.LeaderboardEntryResponse.builder()
                    .rank(rank++)
                    .userId(p.getUser().getId())
                    .userName(p.getUser().getName())
                    .score(p.getScore())
                    .problemsSolved(p.getProblemsSolved())
                    .penaltyMinutes(p.getPenaltySeconds() / 60)
                    .problemResults(problemMap)
                    .build());
        }

        return result;
    }

    public List<SubmissionDto.Response> getContestSubmissions(Long contestId) {
        return submissionRepository.findByContestIdOrderBySubmittedAtDesc(contestId).stream()
                .map(s -> SubmissionDto.Response.builder()
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
                        .build())
                .collect(Collectors.toList());
    }

    private void recalculateLeaderboardRanks(Long contestId) {
        List<ContestParticipant> list = contestParticipantRepository.findByContestIdOrderByScoreDescPenaltySecondsAsc(contestId);
        int pos = 1;
        for (ContestParticipant cp : list) {
            cp.setRankPosition(pos++);
            contestParticipantRepository.save(cp);
        }
    }

    private void updateDynamicStatus(Contest contest) {
        LocalDateTime now = LocalDateTime.now();
        if (contest.getStatus() != ContestStatus.DRAFT) {
            if (now.isBefore(contest.getStartTime())) {
                contest.setStatus(ContestStatus.PUBLISHED);
            } else if (now.isAfter(contest.getEndTime())) {
                contest.setStatus(ContestStatus.COMPLETED);
            } else {
                contest.setStatus(ContestStatus.LIVE);
            }
        }
    }

    private ContestDto.SummaryResponse mapToSummary(Contest c, User user) {
        boolean isReg = user != null && contestParticipantRepository.existsByContestIdAndUserId(c.getId(), user.getId());
        long partCount = contestParticipantRepository.countByContestId(c.getId());
        int probCount = contestProblemRepository.findByContestIdOrderByProblemOrderAsc(c.getId()).size();

        return ContestDto.SummaryResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .durationMinutes(c.getDurationMinutes())
                .status(c.getStatus())
                .totalProblems(probCount)
                .totalParticipants(partCount)
                .isRegistered(isReg)
                .createdByName(c.getCreatedBy() != null ? c.getCreatedBy().getName() : "Admin")
                .build();
    }
}
