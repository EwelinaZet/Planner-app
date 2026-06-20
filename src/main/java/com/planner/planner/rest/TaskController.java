package com.planner.planner.rest;

import com.planner.planner.entity.Task;
import com.planner.planner.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/")
    public String index(Model model) {
        if (!model.containsAttribute("task")) {
            model.addAttribute("task", new Task());
        }
        model.addAttribute("tasks", taskService.findAll());
        return "index";
    }

    @PostMapping("/add")
    public String addTask(@Valid @ModelAttribute("task") Task task,
                          BindingResult bindingResult,
                          Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("tasks", taskService.findAll());
            return "index";
        }

        taskService.add(task.getTitle(), task.getDescription());
        return "redirect:/";
    }

    @PostMapping("/toggle/{id}")
    public String toggleTask(@PathVariable Long id) {
        taskService.toggleCompleted(id);
        return "redirect:/";
    }

    @PostMapping("/delete/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return "redirect:/";
    }
}
