package com.planner.planner.entity;

import jakarta.persistence.*;

@Entity
@Table(name= "household_members")
public class HouseholdMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="household_id", nullable = false)
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HouseholdRole role;

    public Household getHousehold() {
        return household;
    }

    public User getUser() {
        return user;
    }

    public HouseholdRole getRole() {
        return role;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setRole(HouseholdRole role) {
        this.role = role;
    }
}