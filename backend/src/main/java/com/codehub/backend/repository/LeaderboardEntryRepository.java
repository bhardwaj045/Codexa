package com.codehub.backend.repository;

import com.codehub.backend.model.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {
    Optional<LeaderboardEntry> findByUserId(Long userId);

    @Query("SELECT le FROM LeaderboardEntry le ORDER BY le.totalPoints DESC, le.problemsSolved DESC, le.updatedAt ASC")
    List<LeaderboardEntry> findAllRanked();
}
