package com.planner.planner.service;

import com.planner.planner.dao.UserRepository;
import com.planner.planner.entity.User;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@TestMethodOrder(MethodOrderer.MethodName.class)
@ExtendWith(MockitoExtension.class)
public class CustomUserDetailsServiceTest {

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Mock
    private UserRepository userRepository;

    @Test
    void loadUserByUsernameTest () {
        String email = "jan.kowalski@example.com";

        User user = new User();
        user.setEmail("jan.kowalski@example.com");
        user.setPassword("encodedSecret123");
        user.setEnabled(true);

        // zwraca usera
        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(user));

        // wykonanie
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        // assert
        assertNotNull(userDetails);
        assertEquals(email, user.getEmail());
        assertEquals("encodedSecret123", user.getPassword());
        assertTrue(user.isEnabled());
        assertTrue(
                userDetails.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_USER")),
                "User should have ROLE_USER authority"
        );

    }

}
