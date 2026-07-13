package com.planner.planner.dao;

import com.planner.planner.entity.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {
}
