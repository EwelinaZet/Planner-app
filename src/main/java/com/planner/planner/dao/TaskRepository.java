package com.planner.planner.dao;

import com.planner.planner.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByAssignedUser_IdAndStartDateLessThanAndEndDateGreaterThan(
            Long userId,
            Instant to,
            Instant from
    );
}
