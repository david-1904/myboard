package com.myboard.repository;

import com.myboard.model.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DashboardRepository extends JpaRepository<Dashboard, Long> {
    Optional<Dashboard> findByUserId(Long userId);
}
