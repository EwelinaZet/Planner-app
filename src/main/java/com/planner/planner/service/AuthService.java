package com.planner.planner.service;

import com.planner.planner.dao.HouseholdMemberRepository;
import com.planner.planner.dao.HouseholdRepository;
import com.planner.planner.dao.RegisterRequest;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.Household;
import com.planner.planner.entity.HouseholdMember;
import com.planner.planner.entity.HouseholdRole;
import com.planner.planner.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(RegisterRequest request) {
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
    }
}
