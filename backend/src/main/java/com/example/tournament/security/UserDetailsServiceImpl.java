package com.example.tournament.security;

import com.example.tournament.domain.UserAccount;
import com.example.tournament.repo.UserAccountRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserAccountRepository repo;

    public UserDetailsServiceImpl(UserAccountRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserAccount ua = repo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new User(
                ua.getEmail(),
                ua.getPasswordHash(),
                ua.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).collect(Collectors.toSet())
        );
    }
}
