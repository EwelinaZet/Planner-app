package com.planner.planner.rest;

import com.planner.planner.dao.TaskRepository;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.CalendarEvent;
import com.planner.planner.entity.User;
import com.planner.planner.service.CalendarService;
import org.springframework.security.core.Authentication;
import org.springframework.scheduling.config.Task;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.nio.file.attribute.UserPrincipal;
import java.time.Instant;
import java.util.List;

@Controller
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository;

    public CalendarController(CalendarService calendarService, UserRepository userRepository) {
        this.calendarService = calendarService;
        this.userRepository = userRepository;
    }

    @GetMapping("/events")
    @ResponseBody
    public List<CalendarEvent> getEvents(
            @RequestParam
            Instant from,

            @RequestParam
            Instant to,

            Authentication authentication
    ) {
        Long userId = getUserId(authentication);
        return calendarService.getEvents(userId, from, to);
    }

//    private Long getUserId(Authentication authentication) {
//        String email = authentication.getName();
//
//        return userRepository
//                .findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"))
//                .getId();
//    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + email));

        System.out.println("email = " + email);
        System.out.println("userId = " + user.getId());

        return user.getId();
    }
}
