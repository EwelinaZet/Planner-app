package com.planner.planner.service;

import com.planner.planner.dao.TaskRepository;
import com.planner.planner.entity.Task;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository  = taskRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public void add(String title, String description) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setCompleted(false);
        taskRepository.save(task);
    }

    public void toggleCompleted(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nie znaleziono taska o id: " + id));

        task.setCompleted(!task.isCompleted());
        taskRepository.save(task);
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }
}
