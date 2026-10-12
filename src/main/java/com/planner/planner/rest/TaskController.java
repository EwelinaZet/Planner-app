package com.planner.planner.rest;

import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.TaskRequest;
import com.planner.planner.dto.TaskResponse;
import com.planner.planner.entity.User;
import com.planner.planner.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService, UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<TaskResponse> list() {
        return taskService.findAll().stream().map(TaskResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@Valid @RequestBody TaskRequest request, Principal principal) {
        User assignedUser = userRepository.findById(request.assignedUserId())
                .orElseThrow(() -> new IllegalArgumentException("Nie znaleziono użytkownika"));

        taskService.add(request.title(), request.description(), principal.getName(),
                request.startDate(), request.endDate(), assignedUser);
    }

    @PostMapping("/{id}/toggle")
    public void toggle(@PathVariable Long id) {
        taskService.toggle(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }
}
