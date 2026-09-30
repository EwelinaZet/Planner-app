package com.planner.planner.service;

import com.planner.planner.dao.HouseholdMemberRepository;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.HouseholdMemberResponse;
import com.planner.planner.entity.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.util.Arrays.stream;

@Service
public class HouseholdMemberService {
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public HouseholdMemberService(HouseholdMemberRepository householdMemberRepository, UserRepository userRepository) {
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    public List<HouseholdMemberResponse> findAllMembersInSameHouseholdAsUser(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "User not found: " + userId));

        return householdMemberRepository
                .findAllMembersInSameHouseholdAsUser(user)
                .stream()
                .map(member -> new HouseholdMemberResponse(
                        member.getId(),
                        member.getUser(),
                        member.getRole()
                ))
                .toList();
    }
}
