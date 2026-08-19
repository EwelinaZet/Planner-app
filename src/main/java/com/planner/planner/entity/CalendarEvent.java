package com.planner.planner.entity;

import java.time.Instant;

public record CalendarEvent (
    Long id,
    String title,
    Instant start,
    Instant end,
    TaskStatus status
) {

}
