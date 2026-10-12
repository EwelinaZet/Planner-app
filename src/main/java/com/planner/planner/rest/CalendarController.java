package com.planner.planner.rest;

import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.CalendarEvent;
import com.planner.planner.service.CalendarService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository;

    public CalendarController(CalendarService calendarService, UserRepository userRepository) {
        this.calendarService = calendarService;
        this.userRepository = userRepository;
    }

    @GetMapping("/events")
    public List<CalendarEvent> getEvents(@RequestParam Instant from, @RequestParam Instant to,
                                         Authentication authentication) {
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()))
                .getId();
        return calendarService.getEvents(userId, from, to);
    }
}