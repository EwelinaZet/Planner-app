package com.planner.planner.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "households")
public class Household extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @OneToMany(mappedBy= "household", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HouseholdMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    public String getName() {
        return name;
    }

    public List<HouseholdMember> getMembers() {
        return members;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setMembers(List<HouseholdMember> members) {
        this.members = members;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
}
