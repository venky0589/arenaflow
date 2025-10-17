package com.example.tournament.web;

import com.example.tournament.domain.Role;
import com.example.tournament.domain.UserAccount;
import com.example.tournament.repo.UserAccountRepository;
import com.example.tournament.security.JwtUtil;
import com.example.tournament.web.dto.LoginRequest;
import com.example.tournament.web.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserAccountRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthController(AuthenticationManager authenticationManager, UserAccountRepository users, PasswordEncoder encoder, JwtUtil jwt) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (users.findByEmail(req.email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        UserAccount ua = new UserAccount();
        ua.setEmail(req.email);
        ua.setPasswordHash(encoder.encode(req.password));
        ua.setRoles(Set.of(Role.USER));
        users.save(ua);
        return ResponseEntity.ok(Map.of("message", "registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email, req.password));
        String token = jwt.createToken(req.email, Map.of("scope", "api"));
        return ResponseEntity.ok(Map.of("token", token));
    }
}
