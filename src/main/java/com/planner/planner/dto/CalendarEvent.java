package com.planner.planner.dto;

import com.planner.planner.entity.TaskStatus;

import java.time.Instant;

public record CalendarEvent (
    Long id,
    String title,
    Instant start,
    Instant end,
    TaskStatus status
) {

}
