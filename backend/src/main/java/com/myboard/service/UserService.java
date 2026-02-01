package com.myboard.service;

import com.myboard.model.Dashboard;
import com.myboard.model.User;
import com.myboard.repository.DashboardRepository;
import com.myboard.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final DashboardRepository dashboardRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, DashboardRepository dashboardRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.dashboardRepository = dashboardRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = new User(username, passwordEncoder.encode(password));
        user = userRepository.save(user);

        Dashboard dashboard = new Dashboard(user);
        dashboardRepository.save(dashboard);

        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of())
                .build();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
