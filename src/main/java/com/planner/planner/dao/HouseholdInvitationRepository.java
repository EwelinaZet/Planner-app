package com.planner.planner.dao;

import com.planner.planner.entity.HouseholdInvitation;
import com.planner.planner.entity.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface HouseholdInvitationRepository extends JpaRepository<HouseholdInvitation, Long> {

    Optional<HouseholdInvitation> findByInvitationCode(String invitationCode);

    boolean existsByHouseholdIdAndEmailAndStatusAndExpiresAtAfter(
            Long householdId, String email, InvitationStatus status, LocalDateTime now);
}
