package com.example.taskmanager.repository;

import com.example.taskmanager.domain.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
  // Bonus for Pagination
  Page<Task> findAllByOwnerId(String ownerId, Pageable pageable);
}
