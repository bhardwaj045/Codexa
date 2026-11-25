package com.codehub.backend.service;

import com.codehub.backend.dto.DashboardDto;
import com.codehub.backend.dto.ProblemDto;
import com.codehub.backend.dto.SubmissionDto;
import com.codehub.backend.dto.UserDto;
import com.codehub.backend.model.*;
import com.codehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final SubmissionService submissionService;
    private final RegistrationSettingService registrationSettingService;

    public DashboardDto.StudentDashboard getStudentDashboard(User user) {
        long totalProblems = problemRepository.count();
        long easyTotal = problemRepository.countByDifficulty(Difficulty.EASY);
        long mediumTotal = problemRepository.countByDifficulty(Difficulty.MEDIUM);
        long hardTotal = problemRepository.countByDifficulty(Difficulty.HARD);

        List<Long> solvedProblemIds = submissionRepository.findSolvedProblemIdsByUser(user.getId(), SubmissionStatus.ACCEPTED);
        List<Problem> solvedProblems = problemRepository.findAllById(solvedProblemIds);

        long easySolved = solvedProblems.stream().filter(p -> p.getDifficulty() == Difficulty.EASY).count();
        long mediumSolved = solvedProblems.stream().filter(p -> p.getDifficulty() == Difficulty.MEDIUM).count();
        long hardSolved = solvedProblems.stream().filter(p -> p.getDifficulty() == Difficulty.HARD).count();

        Map<String, Integer> topicBreakdown = new HashMap<>();
        for (Problem p : solvedProblems) {
            String topic = p.getTopic() != null ? p.getTopic() : "General";
            topicBreakdown.put(topic, topicBreakdown.getOrDefault(topic, 0) + 1);
        }

        List<Submission> userSubmissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        long userAcceptedSubmissions = userSubmissions.stream()
                .filter(s -> s.getSubmissionStatus() == SubmissionStatus.ACCEPTED)
                .count();

        double acceptanceRate = userSubmissions.isEmpty() ? 0.0 :
                Math.round(((double) userAcceptedSubmissions / userSubmissions.size()) * 1000.0) / 10.0;

        // Next Challenge (first problem not yet solved by user)
        List<Problem> allProblems = problemRepository.findAll();
        Problem nextProblem = allProblems.stream()
                .filter(p -> !solvedProblemIds.contains(p.getId()))
                .findFirst()
                .orElse(null);

        ProblemDto nextChallengeDto = null;
        if (nextProblem != null) {
            nextChallengeDto = ProblemDto.builder()
                    .id(nextProblem.getId())
                    .title(nextProblem.getTitle())
                    .description(nextProblem.getDescription())
                    .difficulty(nextProblem.getDifficulty())
                    .topic(nextProblem.getTopic())
                    .build();
        }

        // Real submission calendar mapping: "YYYY-MM-DD" -> count
        Map<String, Integer> submissionCalendar = new TreeMap<>();
        for (Submission s : userSubmissions) {
            if (s.getSubmittedAt() != null) {
                String dateKey = s.getSubmittedAt().toLocalDate().toString();
                submissionCalendar.put(dateKey, submissionCalendar.getOrDefault(dateKey, 0) + 1);
            }
        }

        int maxStreak = 0;
        int currentStreak = 0;
        if (!userSubmissions.isEmpty()) {
            List<java.time.LocalDate> uniqueDates = userSubmissions.stream()
                    .map(s -> s.getSubmittedAt().toLocalDate())
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            int runningStreak = 0;
            java.time.LocalDate prevDate = null;
            for (java.time.LocalDate d : uniqueDates) {
                if (prevDate == null || d.equals(prevDate.plusDays(1))) {
                    runningStreak++;
                } else {
                    runningStreak = 1;
                }
                if (runningStreak > maxStreak) {
                    maxStreak = runningStreak;
                }
                prevDate = d;
            }

            java.time.LocalDate today = java.time.LocalDate.now();
            Set<java.time.LocalDate> dateSet = new HashSet<>(uniqueDates);
            java.time.LocalDate checkDate = dateSet.contains(today) ? today : today.minusDays(1);
            while (dateSet.contains(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            }
        }

        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(user.getId()).orElse(null);
        int totalPoints = entry != null ? entry.getTotalPoints() : 0;
        Integer rankPosition = entry != null ? entry.getRankPosition() : null;

        List<SubmissionDto.Response> recent = userSubmissions.stream()
                .limit(10)
                .map(s -> SubmissionDto.Response.builder()
                        .id(s.getId())
                        .problemId(s.getProblem().getId())
                        .problemTitle(s.getProblem().getTitle())
                        .programmingLanguage(s.getProgrammingLanguage())
                        .submissionStatus(s.getSubmissionStatus())
                        .executionTimeMs(s.getExecutionTimeMs())
                        .memoryUsedKb(s.getMemoryUsedKb())
                        .submittedAt(s.getSubmittedAt())
                        .sourceCode(s.getSourceCode())
                        .build())
                .collect(Collectors.toList());

        return DashboardDto.StudentDashboard.builder()
                .userId(user.getId())
                .name(user.getName())
                .problemsSolved(solvedProblems.size())
                .totalPoints(totalPoints)
                .rankPosition(rankPosition != null ? rankPosition : 1)
                .totalAvailableProblems(totalProblems)
                .easySolved(easySolved)
                .easyTotal(easyTotal)
                .mediumSolved(mediumSolved)
                .mediumTotal(mediumTotal)
                .hardSolved(hardSolved)
                .hardTotal(hardTotal)
                .acceptanceRate(acceptanceRate)
                .acceptedSubmissions(userAcceptedSubmissions)
                .totalSubmissions(userSubmissions.size())
                .currentStreak(currentStreak)
                .maxStreak(maxStreak)
                .submissionCalendar(submissionCalendar)
                .nextChallenge(nextChallengeDto)
                .topicBreakdown(topicBreakdown)
                .recentSubmissions(recent)
                .build();
    }

    public DashboardDto.AdminDashboard getAdminDashboard() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalStudents = users.stream().filter(u -> u.getUserRole() == UserRole.STUDENT).count();
        long totalAdmins = users.stream().filter(u -> u.getUserRole() == UserRole.ADMIN).count();

        long totalProblems = problemRepository.count();
        long easyProblems = problemRepository.countByDifficulty(Difficulty.EASY);
        long mediumProblems = problemRepository.countByDifficulty(Difficulty.MEDIUM);
        long hardProblems = problemRepository.countByDifficulty(Difficulty.HARD);

        long totalSubmissions = submissionRepository.count();
        long acceptedSubmissions = submissionRepository.countBySubmissionStatus(SubmissionStatus.ACCEPTED);

        double acceptanceRate = totalSubmissions == 0 ? 0.0 :
                Math.round(((double) acceptedSubmissions / totalSubmissions) * 1000.0) / 10.0;

        List<SubmissionDto.Response> recent = submissionService.getAllSubmissions().stream()
                .limit(8)
                .collect(Collectors.toList());

        int maxLimit = registrationSettingService.getMaxRegistrationLimit();
        long remainingSpots = registrationSettingService.getRemainingRegistrationSlots(totalStudents);
        boolean regEnabled = registrationSettingService.isRegistrationEnabled();

        List<UserDto> registeredUsers = getAllUsers();

        return DashboardDto.AdminDashboard.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalAdmins(totalAdmins)
                .totalProblems(totalProblems)
                .easyProblems(easyProblems)
                .mediumProblems(mediumProblems)
                .hardProblems(hardProblems)
                .totalSubmissions(totalSubmissions)
                .acceptedSubmissions(acceptedSubmissions)
                .overallAcceptanceRate(acceptanceRate)
                .maxAllowedUsers(maxLimit)
                .remainingRegistrationSpots(remainingSpots)
                .registrationEnabled(regEnabled)
                .recentSubmissions(recent)
                .registeredUsers(registeredUsers)
                .build();
    }

    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getUserRole() == UserRole.STUDENT)
                .collect(Collectors.toList());
        Map<Long, LeaderboardEntry> leaderboardMap = leaderboardEntryRepository.findAll().stream()
                .filter(e -> e.getUser() != null)
                .collect(Collectors.toMap(e -> e.getUser().getId(), e -> e, (a, b) -> a));

        return users.stream().map(u -> {
            LeaderboardEntry entry = leaderboardMap.get(u.getId());
            long userSubmissionsCount = submissionRepository.findByUserIdOrderBySubmittedAtDesc(u.getId()).size();
            return UserDto.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .userRole(u.getUserRole())
                    .createdAt(u.getCreatedAt())
                    .problemsSolved(entry != null ? entry.getProblemsSolved() : 0)
                    .totalPoints(entry != null ? entry.getTotalPoints() : 0)
                    .rankPosition(entry != null ? entry.getRankPosition() : null)
                    .totalSubmissions(userSubmissionsCount)
                    .build();
        }).collect(Collectors.toList());
    }

    public DashboardDto.RegistrationLimitResponse getRegistrationLimit() {
        long currentStudents = userRepository.countByUserRole(UserRole.STUDENT);
        int maxLimit = registrationSettingService.getMaxRegistrationLimit();
        long remaining = registrationSettingService.getRemainingRegistrationSlots(currentStudents);
        boolean enabled = registrationSettingService.isRegistrationEnabled();

        return DashboardDto.RegistrationLimitResponse.builder()
                .maxUsers(maxLimit)
                .currentUsers(currentStudents)
                .remainingSpots(remaining)
                .registrationEnabled(enabled)
                .build();
    }

    public DashboardDto.RegistrationLimitResponse updateRegistrationLimit(DashboardDto.RegistrationLimitRequest request) {
        if (request.getMaxUsers() > 0) {
            registrationSettingService.setMaxRegistrationLimit(request.getMaxUsers());
        }
        if (request.getRegistrationEnabled() != null) {
            registrationSettingService.setRegistrationEnabled(request.getRegistrationEnabled());
        }
        return getRegistrationLimit();
    }
}
