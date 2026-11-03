package com.planner.planner.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="household_invitations")
public class HouseholdInvitation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="household_id", nullable = false)
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="invited_by_user_id", nullable = false)
    private User invitedBy;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name="invitation_code", nullable = false, length = 64)
    private String invitationCode;

    @Column(name="expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvitationStatus status;

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public User getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(User user) {
        this.invitedBy = user;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getInvitationCode() {
        return invitationCode;
    }

    public void setInvitationCode(String invitationCode) {
        this.invitationCode = invitationCode;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }
}
