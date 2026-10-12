package com.planner.planner.rest;

import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.HouseholdMemberResponse;
import com.planner.planner.service.HouseholdMemberService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/household-members")
public class HouseholdMemberController {
    private final HouseholdMemberService householdMemberService;
    private final UserRepository userRepository;

    public HouseholdMemberController(HouseholdMemberService householdMemberService, UserRepository userRepository) {
        this.householdMemberService = householdMemberService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<HouseholdMemberResponse> list(Authentication authentication) {
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()))
                .getId();
        return householdMemberService.findAllMembersInSameHouseholdAsUser(userId);
    }
}
