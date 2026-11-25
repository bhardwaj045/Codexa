package com.codehub.backend.repository;

import com.codehub.backend.model.Difficulty;
import com.codehub.backend.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByDifficulty(Difficulty difficulty);
    List<Problem> findByTopicIgnoreCase(String topic);

    @Query("SELECT p FROM Problem p WHERE " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.topic) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:difficulty IS NULL OR p.difficulty = :difficulty) " +
           "AND (:topic IS NULL OR LOWER(p.topic) = LOWER(:topic)) " +
           "ORDER BY p.id ASC")
    List<Problem> searchProblems(
        @Param("query") String query,
        @Param("difficulty") Difficulty difficulty,
        @Param("topic") String topic
    );

    @Query("SELECT DISTINCT p.topic FROM Problem p WHERE p.topic IS NOT NULL")
    List<String> findDistinctTopics();

    long countByDifficulty(Difficulty difficulty);
}
