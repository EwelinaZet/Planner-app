package com.planner.planner.rest;

import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.HouseholdMemberResponse;
import com.planner.planner.entity.User;
import com.planner.planner.service.HouseholdMemberService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class HouseholdMemberController {
    private final HouseholdMemberService hauseholdMemberService;
    private final UserRepository userRepository;

    public HouseholdMemberController(HouseholdMemberService hauseholdMemberService, UserRepository userRepository) {
        this.hauseholdMemberService = hauseholdMemberService;
        this.userRepository = userRepository;
    }

    @GetMapping("/hausehold-members")
    @ResponseBody
    public List<HouseholdMemberResponse>getHouseholdMembers(Authentication authentication) {
            Long userId = getUserId(authentication);
            return hauseholdMemberService.findAllMembersInSameHouseholdAsUser(userId);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + email));

        System.out.println("email = " + email);
        System.out.println("userId = " + user.getId());

        return user.getId();
    }

}
