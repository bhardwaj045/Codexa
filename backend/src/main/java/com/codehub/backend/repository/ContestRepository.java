package com.codehub.backend.repository;

import com.codehub.backend.model.Contest;
import com.codehub.backend.model.ContestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    List<Contest> findAllByOrderByStartTimeDesc();
    List<Contest> findByStatusOrderByStartTimeDesc(ContestStatus status);
}
