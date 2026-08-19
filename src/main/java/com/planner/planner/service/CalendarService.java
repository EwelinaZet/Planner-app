package com.planner.planner.service;

import com.planner.planner.dao.TaskRepository;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.CalendarEvent;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CalendarService {

    private final TaskRepository taskRepository;

    public CalendarService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<CalendarEvent> getEvents(Long id, Instant from, Instant to) {
        return taskRepository.findAllByAssignedUser_IdAndStartDateLessThanAndEndDateGreaterThan(id, to, from)
                .stream()
                .map(task -> new CalendarEvent(
                        task.getId(),
                        task.getTitle(),
                        task.getStartDate(),
                        task.getEndDate(),
                        task.getStatus()
                ))
                .toList();
    }
}
