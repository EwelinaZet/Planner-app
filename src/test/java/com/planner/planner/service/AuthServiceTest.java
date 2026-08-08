package com.planner.planner.service;

import com.planner.planner.dao.HouseholdMemberRepository;
import com.planner.planner.dao.HouseholdRepository;
import com.planner.planner.dao.RegisterRequest;
import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.Household;
import com.planner.planner.entity.HouseholdMember;
import com.planner.planner.entity.HouseholdRole;
import com.planner.planner.entity.User;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import static org.mockito.Mockito.when;

@TestMethodOrder(MethodOrderer.MethodName.class)
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    UserRepository userRepository;

    @Mock
    HouseholdRepository householdRepository;

    @Mock
    HouseholdMemberRepository householdMemberRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Test
    void testRegister() {
        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Jan");
        request.setLastName("Kowalski");
        request.setEmail("jan.kowalski@example.com");
        request.setPassword("secret123");
        request.setHouseholdName("Dom Kowalskich");


        // istniejacy uzytkownik NIE istnieje
        when(userRepository.existsByEmail("jan.kowalski@example.com"))
                .thenReturn(false);

        // enkodowanie hasla
        when(passwordEncoder.encode("secret123"))
                .thenReturn("encodedSecret123");

        // symuluacja save – zwracanie obiektu z wypełnionymi ID
        User savedUser = new User();
        savedUser.setFirstName("Jan");
        savedUser.setLastName("Kowalski");
        savedUser.setEmail("jan.kowalski@example.com");
        savedUser.setPassword("encodedSecret123");
        savedUser.setEnabled(true);

        Household savedHousehold = new Household();
        savedHousehold.setName("Dom Kowalskich");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(request);

        // Assert
        assertNotNull(result);
        assertEquals("Jan", result.getFirstName());
        assertEquals("Kowalski", result.getLastName());
        assertEquals("jan.kowalski@example.com", result.getEmail());
        assertTrue(result.isEnabled());

        verify(userRepository).existsByEmail("jan.kowalski@example.com");
        verify(passwordEncoder).encode("secret123");
        verify(userRepository).save(any(User.class));

    }

}
