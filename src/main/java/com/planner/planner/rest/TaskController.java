package com.planner.planner.rest;

import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.Task;
import com.planner.planner.entity.TaskStatus;
import com.planner.planner.entity.User;
import com.planner.planner.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;

@Controller
public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService, UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public String index(Model model) {
        if (!model.containsAttribute("task")) {
            model.addAttribute("task", new Task());
        }
        model.addAttribute("tasks", taskService.findAll());
        return "index";
    }

//    @PostMapping("/add")
//    public String addTask(@Valid @ModelAttribute("task") Task task,
//                          BindingResult bindingResult, RedirectAttributes redirectAttributes,
//                          Principal principal) {
//        try {
//            taskService.add(task.getTitle(), task.getDescription(), principal.getName(), task.getStartDate(), task.getEndDate(), task.getAssignedUser());
//        } catch (IllegalArgumentException e) {
//            bindingResult.rejectValue("endDate", "endDate error", e.getMessage());
//        }
//
//        if (bindingResult.hasErrors()) {
//            redirectAttributes.addFlashAttribute(
//                    "org.springframework.validation.BindingResult.task", bindingResult);
//            redirectAttributes.addFlashAttribute("task", task);
//        }
//        return "redirect:/";
//    }
@PostMapping("/add")
public String addTask(
        @Valid @ModelAttribute("task") Task task,
        BindingResult bindingResult,
        RedirectAttributes redirectAttributes,
        Principal principal
) {
    try {
        if (task.getAssignedUser() == null
                || task.getAssignedUser().getId() == null) {
            throw new IllegalArgumentException(
                    "Nie wybrano użytkownika"
            );
        }

        User assignedUser = userRepository.findById(
                task.getAssignedUser().getId()
        ).orElseThrow(() -> new IllegalArgumentException(
                "Nie znaleziono użytkownika"
        ));

        taskService.add(
                task.getTitle(),
                task.getDescription(),
                principal.getName(),
                task.getStartDate(),
                task.getEndDate(),
                assignedUser
        );
    } catch (IllegalArgumentException e) {
        bindingResult.rejectValue(
                "assignedUser",
                "assignedUser.error",
                e.getMessage()
        );

        redirectAttributes.addFlashAttribute(
                "org.springframework.validation.BindingResult.task",
                bindingResult
        );
        redirectAttributes.addFlashAttribute("task", task);
    }

    return "redirect:/";
}

    @PostMapping("/delete/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return "redirect:/";
    }

    @PostMapping("/toggle/{id}")
    public String toggleTask(@PathVariable Long id) {
        taskService.toggle(id);
        return "redirect:/";
    }
}
