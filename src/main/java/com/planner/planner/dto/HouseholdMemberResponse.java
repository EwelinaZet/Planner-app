package com.planner.planner.dto;

import com.planner.planner.entity.HouseholdRole;
import com.planner.planner.entity.User;

public record HouseholdMemberResponse(
        Long id,
        User user,
        HouseholdRole role
) {
}