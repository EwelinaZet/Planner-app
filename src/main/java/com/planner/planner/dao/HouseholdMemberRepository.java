package com.planner.planner.dao;

import com.planner.planner.entity.HouseholdMember;
import com.planner.planner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {
    Optional<HouseholdMember> findByUser(User user);
}