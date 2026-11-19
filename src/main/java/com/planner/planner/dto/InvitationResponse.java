package com.planner.planner.dto;

import com.planner.planner.entity.HouseholdInvitation;
import com.planner.planner.entity.InvitationStatus;

import java.time.LocalDateTime;

public record InvitationResponse(
        Long id,
        String email,
        InvitationStatus status,
        String link,
        LocalDateTime expiresAt
) {
    public static InvitationResponse from(HouseholdInvitation invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getStatus(),
                "http://localhost:5173/invite/" + invitation.getInvitationCode(),
                invitation.getExpiresAt()
        );
    }
}