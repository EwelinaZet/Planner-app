package com.planner.planner.rest;

import com.planner.planner.dao.HouseholdInvitationRepository;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.CreateInvitationRequest;
import com.planner.planner.dto.InvitationPreviewResponse;
import com.planner.planner.dto.InvitationResponse;
import com.planner.planner.entity.Household;
import com.planner.planner.entity.HouseholdInvitation;
import com.planner.planner.entity.InvitationStatus;
import com.planner.planner.service.HouseholdInvitationService;
import jakarta.persistence.Column;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
public class HouseholdInvitationController {
    private final HouseholdInvitationService householdInvitationService;
    private final HouseholdInvitationRepository householdInvitationRepository;
    private final UserRepository userRepository;

    public HouseholdInvitationController(HouseholdInvitationService householdInvitationService, HouseholdInvitationRepository householdInvitationRepository, UserRepository userRepository) {
        this.householdInvitationService = householdInvitationService;
        this.householdInvitationRepository = householdInvitationRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/household-invitation")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse create(@Valid @RequestBody CreateInvitationRequest request, Authentication authentication) {
        return householdInvitationService.create(authentication.getName(), request.email());
    }

    @GetMapping("/api/invitations/{code}")
    public InvitationPreviewResponse preview(@PathVariable String code) {
       return householdInvitationService.getPreview(code);
    }

    @PostMapping("/{code}/accept")
    public boolean acceptInvitation(Long householdId, String email, InvitationStatus status, LocalDateTime now) {
        return householdInvitationRepository.existsByHouseholdIdAndEmailAndStatusAndExpiresAtAfter(householdId, email, status, now);
    }

    @GetMapping("/api/household-invitation")
    public List<InvitationResponse> list(Authentication authentication) {
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()))
                .getId();
        return householdInvitationService.findAllForUserHousehold(userId);
    }
}
