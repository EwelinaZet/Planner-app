package com.planner.planner.dto;

import com.planner.planner.entity.Task;
import com.planner.planner.entity.TaskStatus;
import com.planner.planner.entity.User;

import java.time.Instant;
import java.time.LocalDateTime;

public record TaskResponse(Long id, String title, String description, TaskStatus status,
                           Instant startDate, Instant endDate, LocalDateTime createdAt,
                           String assignedTo, String createdBy) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(),
                task.getStartDate(), task.getEndDate(), task.getCreatedAt(),
                name(task.getAssignedUser()), name(task.getCreatedBy()));
    }

    private static String name(User user) {
        return user == null ? null : user.getFirstName() + " " + user.getLastName();
    }
}
