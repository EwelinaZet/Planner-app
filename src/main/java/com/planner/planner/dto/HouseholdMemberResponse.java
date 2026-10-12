package com.planner.planner.dto;

import com.planner.planner.entity.HouseholdRole;

public record HouseholdMemberResponse(
        Long id,
        Long userId,
        String firstName,
        String lastName,
        HouseholdRole role
) {
}