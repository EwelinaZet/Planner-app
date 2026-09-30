package com.planner.planner.dao;

import com.planner.planner.entity.HouseholdMember;
import com.planner.planner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;import java.util.List;
import java.util.Optional;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {
    Optional<HouseholdMember> findByUser(User user);
    List<HouseholdMember> findAllByHouseholdId(Long householdId);
    @Query("""
    select hm
    from HouseholdMember hm
    where hm.household = (
        select selectedMember.household
        from HouseholdMember selectedMember
        where selectedMember.user = :user
    )
""")
    List<HouseholdMember> findAllMembersInSameHouseholdAsUser(
            @Param("user") User user
    );
}