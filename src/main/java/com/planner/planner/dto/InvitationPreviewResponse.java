package com.planner.planner.dto;

import java.time.LocalDateTime;

public record InvitationPreviewResponse (
        String householdName,
        String invitedByFirstName,
        String email,
        LocalDateTime expiresAt
){

}