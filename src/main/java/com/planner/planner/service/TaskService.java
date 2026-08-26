package com.planner.planner.service;

import com.planner.planner.dao.HouseholdMemberRepository;
import com.planner.planner.dao.TaskRepository;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.HouseholdMember;
import com.planner.planner.entity.Task;
import com.planner.planner.entity.TaskStatus;
import com.planner.planner.entity.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final HouseholdMemberRepository householdMemberRepository;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       HouseholdMemberRepository householdMemberRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.householdMemberRepository = householdMemberRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }


    public void toggle(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new IllegalStateException("Nie znaleziono zadania"));

        TaskStatus next = switch (task.getStatus()) {
            case TODO -> TaskStatus.IN_PROGRESS;
            case IN_PROGRESS -> TaskStatus.DONE;
            case DONE -> TaskStatus.TODO;
        };
        task.setStatus(next);
        taskRepository.save(task); // Bez tego (i bez @Transactional) zmiana statusu nie zostanie zapisana do bazy, bo sesja zamyka się po findById
    }

    public void add(String title, String description, String userEmail, Instant startDate, Instant endDate) {


        System.out.println("startDate = " + startDate);
        System.out.println("endDate = " + endDate);
        System.out.println(
                "end after start = " +
                        endDate.isAfter(startDate)
        );
        if(!endDate.isAfter(startDate)) {
            throw new IllegalArgumentException(
                    "End date must be after start date"
            );
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalStateException("Nie znaleziono użytkownika"));

        HouseholdMember member = householdMemberRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Użytkownik nie należy do żadnego gospodarstwa"));

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStartDate(startDate);
        task.setEndDate(endDate);
        task.setHousehold(member.getHousehold());
        task.setCreatedBy(user);
        taskRepository.save(task);
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }
}