package com.planner.planner.dto;

import java.time.LocalDateTime;

public record InvitationResponse (
    String email,
    String link,
    LocalDateTime expiresAt
){

}