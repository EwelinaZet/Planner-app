package com.planner.planner.service;

import com.planner.planner.dao.HouseholdInvitationRepository;
import com.planner.planner.dao.HouseholdMemberRepository;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.dto.InvitationPreviewResponse;
import com.planner.planner.dto.InvitationResponse;
import com.planner.planner.entity.*;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class HouseholdInvitationService {
    private static final Logger log = LoggerFactory.getLogger(HouseholdMemberService.class);

    private static final int EXPIRATION_DAYS = 7;
    private final SecureRandom secureRandom = new SecureRandom();

    private final HouseholdInvitationRepository householdInvitationRepository;
    private final UserRepository userRepository;
    private final HouseholdMemberRepository householdMemberRepository;

    public HouseholdInvitationService(HouseholdInvitationRepository householdInvitationRepository, UserRepository userRepository, HouseholdMemberRepository householdMemberRepository) {
        this.householdInvitationRepository = householdInvitationRepository;
        this.userRepository = userRepository;
        this.householdMemberRepository = householdMemberRepository;
    }

    private HouseholdInvitation checkInvitation(String code){
        HouseholdInvitation invitation =  householdInvitationRepository.findByInvitationCode(code)
                .orElseThrow(() -> new IllegalStateException("Nie znaleziono zaproszenia"));

        LocalDateTime now = LocalDateTime.now();
        if (invitation.getExpiresAt().isBefore(now) ||
                invitation.getStatus() != InvitationStatus.PENDING
        ) {
            throw new IllegalArgumentException(
                    "Zaproszenie wygasło"
            );
        }

        return invitation;
    }

    @Transactional
    public InvitationResponse create(String ownerEmail, String invitedEmial) {
        System.out.println("Wiadomość w konsoli: Serwis został uruchomiony.");
        String email = invitedEmial.trim().toLowerCase();

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("nie znaleziono uzytkownika"));

        HouseholdMember ownerMember = householdMemberRepository.findByUser(owner)
                .orElseThrow(() -> new IllegalArgumentException("nie nalezysz do gospodarstwa"));

        if(ownerMember.getRole() != HouseholdRole.OWNER) {
            throw new IllegalArgumentException("tylko właściciel gospodarstwa może zapraszać\"");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("ta osoba ma już konto");
        }
        System.out.println("Wiadomość w konsoli: Serwis został uruchomiony.");
        if(householdInvitationRepository.existsByHouseholdIdAndEmailAndStatusAndExpiresAtAfter(
                ownerMember.getHouseholdId(), email, InvitationStatus.PENDING, LocalDateTime.now()
        )){
            throw new IllegalArgumentException("ta osoba ma już aktywne zaproszenie");
        }



        HouseholdInvitation invitation = new HouseholdInvitation();
        invitation.setHousehold(ownerMember.getHousehold());
        invitation.setInvitedBy(owner);
        invitation.setEmail(email);
        invitation.setInvitationCode(generateCode());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS));
        invitation.setStatus(InvitationStatus.PENDING);

        householdInvitationRepository.saveAndFlush(invitation);

        String link = "http://localhost:5173/invite/" + invitation.getInvitationCode();
        return new InvitationResponse(email, link, invitation.getExpiresAt());
    }

    private String generateCode() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional(readOnly = true)
    public InvitationPreviewResponse getPreview(String code){
        HouseholdInvitation invitation = checkInvitation(code);

        InvitationPreviewResponse preview = new InvitationPreviewResponse(
                invitation.getHousehold().getName(),
                invitation.getInvitedBy().getFirstName(),
                invitation.getEmail(),
                invitation.getExpiresAt()
        );
        return  preview;
    }

    @Transactional
    public void joinHousehold(String code, User user) {
        HouseholdInvitation invitation = checkInvitation(code);

        if (!invitation.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException(
            );
        }

        User newUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Nie znaleziono użytkownika"));

        HouseholdMember member = new HouseholdMember();
        member.setHousehold(invitation.getHousehold());
        member.setUser(newUser);
        member.setRole(HouseholdRole.MEMBER);
        householdMemberRepository.save(member);
        invitation.setStatus(InvitationStatus.ACCEPTED);
    }
}
