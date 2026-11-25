package com.codehub.backend.service;

import com.codehub.backend.dto.AuthDto;
import com.codehub.backend.model.LeaderboardEntry;
import com.codehub.backend.model.User;
import com.codehub.backend.model.UserRole;
import com.codehub.backend.repository.LeaderboardEntryRepository;
import com.codehub.backend.repository.UserRepository;
import com.codehub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RegistrationSettingService registrationSettingService;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }

        UserRole role = request.getUserRole() != null ? request.getUserRole() : UserRole.STUDENT;

        if (role == UserRole.ADMIN) {
            long existingAdmins = userRepository.countByUserRole(UserRole.ADMIN);
            if (existingAdmins > 0) {
                throw new RuntimeException("An administrator account already exists. Multiple admin accounts cannot be created.");
            }
        }

        if (role == UserRole.STUDENT) {
            long currentStudents = userRepository.countByUserRole(UserRole.STUDENT);
            if (!registrationSettingService.canUserRegister(currentStudents)) {
                if (!registrationSettingService.isRegistrationEnabled()) {
                    throw new RuntimeException("New user registration is currently closed by the administrator.");
                }
                throw new RuntimeException("Registration limit reached: Maximum capacity of "
                        + registrationSettingService.getMaxRegistrationLimit()
                        + " registered users has been reached.");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userRole(role)
                .build();

        User savedUser = userRepository.save(user);

        // Create initial leaderboard entry for students
        if (role == UserRole.STUDENT) {
            LeaderboardEntry entry = LeaderboardEntry.builder()
                    .user(savedUser)
                    .problemsSolved(0)
                    .totalPoints(0)
                    .build();
            leaderboardEntryRepository.save(entry);
        }

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getUserRole().name());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .userRole(savedUser.getUserRole())
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String inputEmail = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmail(inputEmail.toLowerCase())
                .or(() -> userRepository.findByEmail(inputEmail))
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!matches) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getUserRole().name());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .userRole(user.getUserRole())
                .build();
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
