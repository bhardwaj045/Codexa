package com.codehub.backend.service;

import com.codehub.backend.model.*;
import com.codehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        @org.springframework.beans.factory.annotation.Value("${app.admin.email:admin@codexa.com}")
        private String adminEmail;

        @org.springframework.beans.factory.annotation.Value("${app.admin.password:admin123}")
        private String adminPassword;

        private final UserRepository userRepository;
        private final ProblemRepository problemRepository;
        private final TestCaseRepository testCaseRepository;
        private final SubmissionRepository submissionRepository;
        private final LeaderboardEntryRepository leaderboardEntryRepository;
        private final ContestRepository contestRepository;
        private final ContestProblemRepository contestProblemRepository;
        private final ContestParticipantRepository contestParticipantRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        @Transactional
        public void run(String... args) {
                ensureAdminAccount();
                ensureStudentAccount();
                cleanupDemoSubmissions();

                if (problemRepository.count() >= 11) {
                        ensureDefaultContest();
                        log.info("Database already seeded with 11 problems. Skipping data initialization.");
                        return;
                }

                log.info("Seeding CodeXa platform with 11 challenges and accounts...");

                // 1. Users
                User admin = userRepository.findByEmail(adminEmail).orElseGet(() ->
                                userRepository.findAll().stream().filter(u -> u.getUserRole() == UserRole.ADMIN).findFirst().orElse(null));

                User student = userRepository.findByEmail("student@codexa.com")
                                .orElseGet(() -> userRepository.save(User.builder()
                                                .name("Test Student")
                                                .email("student@codexa.com")
                                                .passwordHash(passwordEncoder.encode("student123"))
                                                .userRole(UserRole.STUDENT)
                                                .build()));

                User priya = userRepository.findByEmail("priya@codexa.com")
                                .orElseGet(() -> userRepository.save(User.builder()
                                                .name("Priya Sharma")
                                                .email("priya@codexa.com")
                                                .passwordHash(passwordEncoder.encode("password123"))
                                                .userRole(UserRole.STUDENT)
                                                .build()));

                User david = userRepository.findByEmail("david@codexa.com")
                                .orElseGet(() -> userRepository.save(User.builder()
                                                .name("David Kim")
                                                .email("david@codexa.com")
                                                .passwordHash(passwordEncoder.encode("password123"))
                                                .userRole(UserRole.STUDENT)
                                                .build()));

                // Clear previous problems to ensure exact 11 problems matching screenshots
                testCaseRepository.deleteAll();
                submissionRepository.deleteAll();
                problemRepository.deleteAll();

                // 1. Two Sum
                Problem p1 = problemRepository.save(Problem.builder()
                                .title("Two Sum")
                                .description("Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.")
                                .difficulty(Difficulty.EASY)
                                .topic("Arrays")
                                .problemConstraints(
                                                "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.")
                                .sampleInput("2 7 11 15\n9")
                                .sampleOutput("0 1")
                                .createdBy(admin)
                                .build());

                // 2. Reverse Array
                Problem p2 = problemRepository.save(Problem.builder()
                                .title("Reverse Array")
                                .description("Given an array of integers, reverse the order of its elements and return the reversed array.")
                                .difficulty(Difficulty.EASY)
                                .topic("Arrays")
                                .problemConstraints("1 <= arr.length <= 10^5\n-10^4 <= arr[i] <= 10^4")
                                .sampleInput("1 2 3 4 5")
                                .sampleOutput("5 4 3 2 1")
                                .createdBy(admin)
                                .build());

                // 3. Reverse String
                Problem p3 = problemRepository.save(Problem.builder()
                                .title("Reverse String")
                                .description("Given a string, reverse all its characters and return the reversed string.")
                                .difficulty(Difficulty.EASY)
                                .topic("Strings")
                                .problemConstraints(
                                                "1 <= str.length <= 10^5\nstr consists of printable ASCII characters.")
                                .sampleInput("hello")
                                .sampleOutput("olleh")
                                .createdBy(admin)
                                .build());

                // 4. Palindrome Number
                Problem p4 = problemRepository.save(Problem.builder()
                                .title("Palindrome Number")
                                .description("Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same forward and backward.")
                                .difficulty(Difficulty.EASY)
                                .topic("Mathematics")
                                .problemConstraints("-2^31 <= x <= 2^31 - 1")
                                .sampleInput("121")
                                .sampleOutput("true")
                                .createdBy(admin)
                                .build());

                // 5. Maximum Subarray
                Problem p5 = problemRepository.save(Problem.builder()
                                .title("Maximum Subarray")
                                .description("Given an integer array nums, find the subarray with the largest sum, and return its sum.")
                                .difficulty(Difficulty.MEDIUM)
                                .topic("Dynamic Programming")
                                .problemConstraints("1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4")
                                .sampleInput("-2 1 -3 4 -1 2 1 -5 4")
                                .sampleOutput("6")
                                .createdBy(admin)
                                .build());

                // 6. Move Zeroes
                Problem p6 = problemRepository.save(Problem.builder()
                                .title("Move Zeroes")
                                .description("Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements in-place.")
                                .difficulty(Difficulty.EASY)
                                .topic("Arrays")
                                .problemConstraints("1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1")
                                .sampleInput("0 1 0 3 12")
                                .sampleOutput("1 3 12 0 0")
                                .createdBy(admin)
                                .build());

                // 7. Longest Substring Without Repeating Characters
                Problem p7 = problemRepository.save(Problem.builder()
                                .title("Longest Substring Without Repeating Characters")
                                .description("Given a string s, find the length of the longest substring without duplicate characters.")
                                .difficulty(Difficulty.MEDIUM)
                                .topic("Strings")
                                .problemConstraints(
                                                "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.")
                                .sampleInput("abcabcbb")
                                .sampleOutput("3")
                                .createdBy(admin)
                                .build());

                // 8. Trapping Rain Water
                Problem p8 = problemRepository.save(Problem.builder()
                                .title("Trapping Rain Water")
                                .description("Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.")
                                .difficulty(Difficulty.HARD)
                                .topic("Two Pointers")
                                .problemConstraints("n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5")
                                .sampleInput("0 1 0 2 1 0 1 3 2 1 2 1")
                                .sampleOutput("6")
                                .createdBy(admin)
                                .build());

                // 9. Valid Anagram
                Problem p9 = problemRepository.save(Problem.builder()
                                .title("Valid Anagram")
                                .description("Given two strings s and t, return true if t is an anagram of s, and false otherwise.")
                                .difficulty(Difficulty.EASY)
                                .topic("Strings")
                                .problemConstraints(
                                                "1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.")
                                .sampleInput("anagram\nnagaram")
                                .sampleOutput("true")
                                .createdBy(admin)
                                .build());

                // 10. Contains Duplicate
                Problem p10 = problemRepository.save(Problem.builder()
                                .title("Contains Duplicate")
                                .description("Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.")
                                .difficulty(Difficulty.EASY)
                                .topic("Arrays")
                                .problemConstraints("1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9")
                                .sampleInput("1 2 3 1")
                                .sampleOutput("true")
                                .createdBy(admin)
                                .build());

                // 11. Climbing Stairs
                Problem p11 = problemRepository.save(Problem.builder()
                                .title("Climbing Stairs")
                                .description("You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?")
                                .difficulty(Difficulty.EASY)
                                .topic("Dynamic Programming")
                                .problemConstraints("1 <= n <= 45")
                                .sampleInput("3")
                                .sampleOutput("3")
                                .createdBy(admin)
                                .build());

                // Test Cases for each
                // P1 Two Sum
                testCaseRepository.save(TestCase.builder().problem(p1).inputData("2 7 11 15\n9").expectedOutput("0 1")
                                .isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p1).inputData("3 2 4\n6").expectedOutput("1 2")
                                .isHidden(false).testCaseOrder(2).build());
                testCaseRepository.save(TestCase.builder().problem(p1).inputData("3 3\n6").expectedOutput("0 1")
                                .isHidden(true).testCaseOrder(3).build());

                // P2 Reverse Array
                testCaseRepository.save(TestCase.builder().problem(p2).inputData("1 2 3 4 5")
                                .expectedOutput("5 4 3 2 1").isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p2).inputData("10 20 30").expectedOutput("30 20 10")
                                .isHidden(false).testCaseOrder(2).build());
                testCaseRepository.save(TestCase.builder().problem(p2).inputData("42").expectedOutput("42")
                                .isHidden(true).testCaseOrder(3).build());

                // P3 Reverse String
                testCaseRepository.save(TestCase.builder().problem(p3).inputData("hello").expectedOutput("olleh")
                                .isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p3).inputData("Hannah").expectedOutput("hannaH")
                                .isHidden(false).testCaseOrder(2).build());
                testCaseRepository.save(TestCase.builder().problem(p3).inputData("a").expectedOutput("a").isHidden(true)
                                .testCaseOrder(3).build());

                // P4 Palindrome Number
                testCaseRepository.save(TestCase.builder().problem(p4).inputData("121").expectedOutput("true")
                                .isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p4).inputData("-121").expectedOutput("false")
                                .isHidden(false).testCaseOrder(2).build());
                testCaseRepository.save(TestCase.builder().problem(p4).inputData("10").expectedOutput("false")
                                .isHidden(true).testCaseOrder(3).build());

                // P5 Maximum Subarray
                testCaseRepository.save(TestCase.builder().problem(p5).inputData("-2 1 -3 4 -1 2 1 -5 4")
                                .expectedOutput("6").isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p5).inputData("1").expectedOutput("1")
                                .isHidden(false).testCaseOrder(2).build());
                testCaseRepository.save(TestCase.builder().problem(p5).inputData("5 4 -1 7 8").expectedOutput("23")
                                .isHidden(true).testCaseOrder(3).build());

                // P6 Move Zeroes
                testCaseRepository.save(TestCase.builder().problem(p6).inputData("0 1 0 3 12")
                                .expectedOutput("1 3 12 0 0").isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p6).inputData("0").expectedOutput("0").isHidden(true)
                                .testCaseOrder(2).build());

                // P7 Longest Substring
                testCaseRepository.save(TestCase.builder().problem(p7).inputData("abcabcbb").expectedOutput("3")
                                .isHidden(false).testCaseOrder(1).build());
                testCaseRepository.save(TestCase.builder().problem(p7).inputData("bbbbb").expectedOutput("1")
                                .isHidden(true).testCaseOrder(2).build());

                // P8 Trapping Rain Water
                testCaseRepository.save(TestCase.builder().problem(p8).inputData("0 1 0 2 1 0 1 3 2 1 2 1")
                                .expectedOutput("6").isHidden(false).testCaseOrder(1).build());

                // P9 Valid Anagram
                testCaseRepository.save(TestCase.builder().problem(p9).inputData("anagram\nnagaram")
                                .expectedOutput("true").isHidden(false).testCaseOrder(1).build());

                // P10 Contains Duplicate
                testCaseRepository.save(TestCase.builder().problem(p10).inputData("1 2 3 1").expectedOutput("true")
                                .isHidden(false).testCaseOrder(1).build());

                // P11 Climbing Stairs
                testCaseRepository.save(TestCase.builder().problem(p11).inputData("3").expectedOutput("3")
                                .isHidden(false).testCaseOrder(1).build());

                // Seed leaderboard without demo submissions for student
                leaderboardEntryRepository.deleteAll();
                leaderboardEntryRepository.save(LeaderboardEntry.builder().user(priya).problemsSolved(8)
                                .totalPoints(150).rankPosition(1).build());
                leaderboardEntryRepository.save(LeaderboardEntry.builder().user(david).problemsSolved(5).totalPoints(90)
                                .rankPosition(2).build());
                leaderboardEntryRepository.save(LeaderboardEntry.builder().user(student).problemsSolved(0)
                                .totalPoints(0).rankPosition(3).build());

                ensureDefaultContest();

                log.info("CodeXa platform seeded with exact 11 challenges successfully!");
        }

        private void cleanupDemoSubmissions() {
                List<Submission> demoSubs = submissionRepository.findAll().stream()
                                .filter(s -> s.getSourceCode() != null && s.getSourceCode().startsWith("// "))
                                .toList();
                if (!demoSubs.isEmpty()) {
                        submissionRepository.deleteAll(demoSubs);
                        log.info("Cleaned up {} legacy demo submissions.", demoSubs.size());
                }
                userRepository.findByEmail("student@codexa.com").ifPresent(student -> {
                        long actualSolved = submissionRepository.countSolvedDistinctProblemsByUser(student.getId(),
                                        SubmissionStatus.ACCEPTED);
                        leaderboardEntryRepository.findByUserId(student.getId()).ifPresent(e -> {
                                e.setProblemsSolved((int) actualSolved);
                                e.setTotalPoints((int) (actualSolved * 10));
                                leaderboardEntryRepository.save(e);
                        });
                });
        }

        private void ensureAdminAccount() {
                createOrUpdateAdmin("admin@codexa.com", "admin123", "Admin");
                createOrUpdateAdmin("admin@codehub.com", "admin124", "Admin");
                if (adminEmail != null && !adminEmail.isBlank()) {
                        createOrUpdateAdmin(adminEmail, adminPassword, "Admin");
                }
        }

        private void ensureStudentAccount() {
                createOrUpdateStudent("student@codexa.com", "student123", "Test Student");
                createOrUpdateStudent("student@codehub.com", "student123", "Test Student");
        }

        private void createOrUpdateStudent(String email, String password, String name) {
                User student = userRepository.findByEmail(email).orElseGet(() -> User.builder()
                                .name(name)
                                .email(email)
                                .build());
                student.setName(name);
                student.setEmail(email);
                student.setPasswordHash(passwordEncoder.encode(password));
                student.setUserRole(UserRole.STUDENT);
                userRepository.save(student);
        }

        private void createOrUpdateAdmin(String email, String password, String name) {
                User admin = userRepository.findByEmail(email).orElseGet(() -> User.builder()
                                .name(name)
                                .email(email)
                                .build());
                admin.setName(name);
                admin.setEmail(email);
                admin.setPasswordHash(passwordEncoder.encode(password));
                admin.setUserRole(UserRole.ADMIN);
                userRepository.save(admin);
        }

        private void ensureDefaultContest() {
                if (contestRepository.count() > 0) {
                        return;
                }

                User admin = userRepository.findAll().stream()
                                .filter(u -> u.getUserRole() == UserRole.ADMIN)
                                .findFirst()
                                .orElse(null);
                if (admin == null) return;

                List<Problem> problems = problemRepository.findAll();
                if (problems.size() < 5) return;

                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                Contest contest = Contest.builder()
                                .title("CodeXa Biweekly Contest 1")
                                .description("Join CodeXa's premier 2-hour competitive programming sprint! Solve 5 algorithmic challenges ranging from easy to medium-hard, race against the live timer, and compete for top ranks on the live leaderboard.")
                                .startTime(now.minusMinutes(20)) // Started 20 minutes ago
                                .endTime(now.plusMinutes(100))    // 100 minutes remaining
                                .durationMinutes(120)            // 2 Hours
                                .status(ContestStatus.LIVE)
                                .createdBy(admin)
                                .build();

                Contest savedContest = contestRepository.save(contest);

                // Assign 5 problems with increasing point values (A:100, B:200, C:200, D:300, E:400)
                int[] points = {100, 200, 200, 300, 400};
                for (int i = 0; i < 5; i++) {
                        ContestProblem cp = ContestProblem.builder()
                                        .contest(savedContest)
                                        .problem(problems.get(i))
                                        .problemOrder(i + 1)
                                        .points(points[i])
                                        .build();
                        contestProblemRepository.save(cp);
                }

                // Seed contestants
                userRepository.findByEmail("priya@codexa.com").ifPresent(priya -> {
                        contestParticipantRepository.save(ContestParticipant.builder()
                                        .contest(savedContest)
                                        .user(priya)
                                        .score(500)
                                        .problemsSolved(3)
                                        .penaltySeconds(42 * 60L)
                                        .rankPosition(1)
                                        .build());
                });

                userRepository.findByEmail("david@codexa.com").ifPresent(david -> {
                        contestParticipantRepository.save(ContestParticipant.builder()
                                        .contest(savedContest)
                                        .user(david)
                                        .score(300)
                                        .problemsSolved(2)
                                        .penaltySeconds(35 * 60L)
                                        .rankPosition(2)
                                        .build());
                });

                log.info("Default 2-Hour Coding Contest seeded with 5 problems successfully!");
        }
}
