package com.planner.planner.service;

import com.planner.planner.dao.*;
import com.planner.planner.dto.InvitationRegisterRequest;
import com.planner.planner.dto.RegisterRequest;
import com.planner.planner.entity.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdInvitationRepository householdInvitationRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            HouseholdRepository householdRepository, HouseholdInvitationRepository householdInvitationRepository,
            HouseholdMemberRepository householdMemberRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
        this.householdInvitationRepository = householdInvitationRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (request.getHouseholdName() == null || request.getHouseholdName().isBlank()) {
            throw new IllegalArgumentException("Nazwa gospodarstwa już istnieje");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Użytkownik o takim emailu już istnieje");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        userRepository.save(user);

        Household household = new Household();
        household.setName(request.getHouseholdName());
        householdRepository.save(household);

        HouseholdMember member = new HouseholdMember();
        member.setUser(user);
        member.setHousehold(household);
        member.setRole(HouseholdRole.OWNER);
        householdMemberRepository.save(member);
        return user;
    }

    @Transactional
    public User registerInvitation(@Valid InvitationRegisterRequest request) {
        HouseholdInvitation invitation = householdInvitationRepository
                .findByInvitationCode(request.getInvitationCode())
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy kod zaproszenia" + request.getInvitationCode() ));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Zaproszenie zostało już wykożystane lub anulowane");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Zaproszenie wygasło");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Użytkownik o takim emailu już istnieje");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        userRepository.save(user);

        Household household = invitation.getHousehold();

        HouseholdMember member = new HouseholdMember();
        member.setUser(user);
        member.setHousehold(household);
        member.setRole(HouseholdRole.MEMBER);
        householdMemberRepository.save(member);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        householdInvitationRepository.save(invitation);

        return user;
    }
}
