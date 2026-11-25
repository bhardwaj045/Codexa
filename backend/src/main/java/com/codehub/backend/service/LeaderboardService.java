package com.codehub.backend.service;

import com.codehub.backend.dto.LeaderboardDto;
import com.codehub.backend.model.*;
import com.codehub.backend.repository.LeaderboardEntryRepository;
import com.codehub.backend.repository.ProblemRepository;
import com.codehub.backend.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;

    @Transactional
    public void updateUserProgress(User user, Problem problem) {
        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(user.getId())
                .orElseGet(() -> LeaderboardEntry.builder()
                        .user(user)
                        .problemsSolved(0)
                        .totalPoints(0)
                        .build());

        // Get all unique solved problems by this user
        List<Long> solvedProblemIds = submissionRepository.findSolvedProblemIdsByUser(user.getId(), SubmissionStatus.ACCEPTED);
        int solvedCount = solvedProblemIds.size();

        // Calculate points based on difficulty
        int totalPts = 0;
        for (Long pid : solvedProblemIds) {
            Optional<Problem> pOpt = problemRepository.findById(pid);
            if (pOpt.isPresent()) {
                Difficulty diff = pOpt.get().getDifficulty();
                if (diff == Difficulty.EASY) totalPts += 10;
                else if (diff == Difficulty.MEDIUM) totalPts += 20;
                else if (diff == Difficulty.HARD) totalPts += 30;
            }
        }

        entry.setProblemsSolved(solvedCount);
        entry.setTotalPoints(totalPts);
        leaderboardEntryRepository.save(entry);

        // Recalculate rank positions
        recalculateRanks();
    }

    @Transactional
    public void recalculateRanks() {
        List<LeaderboardEntry> ranked = leaderboardEntryRepository.findAllRanked();
        int rank = 1;
        for (LeaderboardEntry e : ranked) {
            e.setRankPosition(rank++);
            leaderboardEntryRepository.save(e);
        }
    }

    public List<LeaderboardDto> getLeaderboard() {
        List<LeaderboardEntry> list = leaderboardEntryRepository.findAllRanked();
        List<LeaderboardDto> dtoList = new ArrayList<>();

        int rank = 1;
        for (LeaderboardEntry e : list) {
            dtoList.add(LeaderboardDto.builder()
                    .rank(rank++)
                    .userId(e.getUser().getId())
                    .name(e.getUser().getName())
                    .email(e.getUser().getEmail())
                    .problemsSolved(e.getProblemsSolved())
                    .totalPoints(e.getTotalPoints())
                    .updatedAt(e.getUpdatedAt())
                    .build());
        }

        return dtoList;
    }
}
