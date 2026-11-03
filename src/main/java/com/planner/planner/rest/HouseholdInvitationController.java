package com.planner.planner.rest;

import com.planner.planner.dao.HouseholdInvitationRepository;
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
import java.util.Optional;

@RestController
public class HouseholdInvitationController {
    private final HouseholdInvitationService householdInvitationService;
    private final HouseholdInvitationRepository householdInvitationRepository;

    public HouseholdInvitationController(HouseholdInvitationService householdInvitationService, HouseholdInvitationRepository householdInvitationRepository) {
        this.householdInvitationService = householdInvitationService;
        this.householdInvitationRepository = householdInvitationRepository;
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

//    @PostMapping("/api/register-invitation")
//    @ResponseStatus(HttpStatus.CREATED)
//    public InvitationResponse registerInvitation(@Valid @RequestBody CreateInvitationRequest request, Authentication authentication) {
//        return householdInvitationService.joinHousehold(authentication.getName());
//    }

    @PostMapping("/{code}/accept")
    public boolean acceptInvitation(Long householdId, String email, InvitationStatus status, LocalDateTime now) {
        return householdInvitationRepository.existsByHouseholdIdAndEmailAndStatusAndExpiresAtAfter(householdId, email, status, now);
    }
}
