package com.myboard.repository;

import com.myboard.model.WidgetInstance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WidgetInstanceRepository extends JpaRepository<WidgetInstance, Long> {
}
